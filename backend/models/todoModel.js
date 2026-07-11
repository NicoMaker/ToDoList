// ============================================================
// models/todoModel.js — Accesso ai dati (tutte le query SQL)
// Espone funzioni Promise così i controller restano puliti.
// ============================================================
const db = require("../config/database");

/** Wrapper Promise per db.all */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

/** Wrapper Promise per db.get */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

/** Wrapper Promise per db.run: risolve con { lastID, changes } */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

const TodoModel = {
  /** Lista con filtri opzionali: completed, priority, search */
  findAll({ completed, priority, search } = {}) {
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
    return all(sql, params);
  },

  /** Singolo todo per id (undefined se non esiste) */
  findById(id) {
    return get("SELECT * FROM todos WHERE id = ?", [id]);
  },

  /** Crea un todo e ritorna la riga appena inserita */
  async create({ title, description = "", priority = "media" }) {
    const { lastID } = await run(
      "INSERT INTO todos (title, description, priority) VALUES (?, ?, ?)",
      [title, description, priority],
    );
    return TodoModel.findById(lastID);
  },

  /**
   * Aggiorna un todo esistente (i campi non passati restano invariati).
   * Ritorna la riga aggiornata, o null se l'id non esiste.
   */
  async update(id, { title, description, completed, priority }) {
    const existing = await TodoModel.findById(id);
    if (!existing) return null;

    const newTitle = title !== undefined ? title : existing.title;
    const newDescription =
      description !== undefined ? description : existing.description;
    const newCompleted =
      completed !== undefined ? (completed ? 1 : 0) : existing.completed;
    const newPriority = priority !== undefined ? priority : existing.priority;

    await run(
      `UPDATE todos
       SET title = ?, description = ?, completed = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newTitle, newDescription, newCompleted, newPriority, id],
    );
    return TodoModel.findById(id);
  },

  /** Inverte lo stato completato. Ritorna la riga aggiornata o null. */
  async toggle(id) {
    const existing = await TodoModel.findById(id);
    if (!existing) return null;

    await run(
      "UPDATE todos SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [existing.completed ? 0 : 1, id],
    );
    return TodoModel.findById(id);
  },

  /** Elimina un todo. Ritorna true se qualcosa è stato eliminato. */
  async remove(id) {
    const { changes } = await run("DELETE FROM todos WHERE id = ?", [id]);
    return changes > 0;
  },

  /** Elimina tutti i completati. Ritorna quanti ne ha eliminati. */
  async clearCompleted() {
    const { changes } = await run("DELETE FROM todos WHERE completed = 1");
    return changes;
  },
};

module.exports = TodoModel;
