const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Middleware di logging semplice
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ---------- GET: leggi tutti i todo ----------
app.get("/api/todos", (req, res) => {
  const { completed, priority, search } = req.query;
  let sql = "SELECT * FROM todos WHERE 1=1";
  const params = [];

  if (completed !== undefined) {
    sql += " AND completed = ?";
    params.push(completed === "true" ? 1 : 0);
  }
  if (priority) {
    sql += " AND priority = ?";
    params.push(priority);
  }
  if (search) {
    sql += " AND (title LIKE ? OR description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY created_at DESC";

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ---------- GET: leggi un singolo todo ----------
app.get("/api/todos/:id", (req, res) => {
  db.get("SELECT * FROM todos WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Todo non trovato" });
    res.json(row);
  });
});

// ---------- POST: crea nuovo todo ----------
app.post("/api/todos", (req, res) => {
  const { title, description, priority } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Il titolo è obbligatorio" });
  }

  const sql = `INSERT INTO todos (title, description, priority) VALUES (?, ?, ?)`;
  const params = [title.trim(), description || "", priority || "media"];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get("SELECT * FROM todos WHERE id = ?", [this.lastID], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json(row);
    });
  });
});

// ---------- PUT: modifica todo esistente ----------
app.put("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, completed, priority } = req.body;

  db.get("SELECT * FROM todos WHERE id = ?", [id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!existing) return res.status(404).json({ error: "Todo non trovato" });

    const newTitle = title !== undefined ? title : existing.title;
    const newDescription =
      description !== undefined ? description : existing.description;
    const newCompleted =
      completed !== undefined ? (completed ? 1 : 0) : existing.completed;
    const newPriority = priority !== undefined ? priority : existing.priority;

    const sql = `
      UPDATE todos
      SET title = ?, description = ?, completed = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(
      sql,
      [newTitle, newDescription, newCompleted, newPriority, id],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        db.get("SELECT * FROM todos WHERE id = ?", [id], (err3, row) => {
          if (err3) return res.status(500).json({ error: err3.message });
          res.json(row);
        });
      },
    );
  });
});

// ---------- PATCH: toggle rapido completamento ----------
app.patch("/api/todos/:id/toggle", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM todos WHERE id = ?", [id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!existing) return res.status(404).json({ error: "Todo non trovato" });

    const newCompleted = existing.completed ? 0 : 1;
    db.run(
      "UPDATE todos SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newCompleted, id],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        db.get("SELECT * FROM todos WHERE id = ?", [id], (err3, row) => {
          if (err3) return res.status(500).json({ error: err3.message });
          res.json(row);
        });
      },
    );
  });
});

// ---------- DELETE: elimina un todo ----------
app.delete("/api/todos/:id", (req, res) => {
  db.run("DELETE FROM todos WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: "Todo non trovato" });
    res.json({
      message: "Todo eliminato con successo",
      id: Number(req.params.id),
    });
  });
});

// ---------- DELETE: elimina tutti i completati ----------
app.delete("/api/todos/clear/completed", (req, res) => {
  db.run("DELETE FROM todos WHERE completed = 1", function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Todo completati eliminati", count: this.changes });
  });
});

app.get("/", (req, res) => {
  res.json({ message: "Todo API attiva su /api/todos" });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
