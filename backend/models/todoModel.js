// ============================================================
// models/todoModel.js — Accesso ai dati
// ============================================================
const { db } = require("../config/database");

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

/** "5" -> "05" */
function pad2(n) {
  return String(n).padStart(2, "0");
}

const TodoModel = {
  // ----- METODI ESISTENTI -----

  findAll({
    completed,
    priority,
    search,
    location,
    date,
    dates,
    year,
    month,
  } = {}) {
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
    if (location) {
      sql += " AND location = ?";
      params.push(location);
    }

    if (dates && dates.length > 0) {
      sql += ` AND due_date IN (${dates.map(() => "?").join(",")})`;
      params.push(...dates);
    } else if (date) {
      sql += " AND due_date = ?";
      params.push(date);
    } else {
      if (year) {
        sql += " AND strftime('%Y', due_date) = ?";
        params.push(String(year));
      }
      if (month) {
        sql += " AND strftime('%m', due_date) = ?";
        params.push(pad2(month));
      }
    }

    sql += " ORDER BY (due_date IS NULL), due_date ASC, created_at DESC";
    return all(sql, params);
  },

  findById(id) {
    return get("SELECT * FROM todos WHERE id = ?", [id]);
  },

  async create({
    title,
    description = "",
    priority = "media",
    due_date = null,
    location = "",
  }) {
    const { lastID } = await run(
      "INSERT INTO todos (title, description, priority, due_date, location) VALUES (?, ?, ?, ?, ?)",
      [title, description, priority, due_date || null, location || ""],
    );
    return TodoModel.findById(lastID);
  },

  async update(
    id,
    { title, description, completed, priority, due_date, location },
  ) {
    const existing = await TodoModel.findById(id);
    if (!existing) return null;

    const newTitle = title !== undefined ? title : existing.title;
    const newDescription =
      description !== undefined ? description : existing.description;
    const newCompleted =
      completed !== undefined ? (completed ? 1 : 0) : existing.completed;
    const newPriority = priority !== undefined ? priority : existing.priority;
    const newDueDate = due_date !== undefined ? due_date : existing.due_date;
    const newLocation = location !== undefined ? location : existing.location;

    await run(
      `UPDATE todos
       SET title = ?, description = ?, completed = ?, priority = ?,
           due_date = ?, location = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        newTitle,
        newDescription,
        newCompleted,
        newPriority,
        newDueDate || null,
        newLocation || "",
        id,
      ],
    );
    return TodoModel.findById(id);
  },

  async toggle(id) {
    const existing = await TodoModel.findById(id);
    if (!existing) return null;

    await run(
      "UPDATE todos SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [existing.completed ? 0 : 1, id],
    );
    return TodoModel.findById(id);
  },

  async remove(id) {
    const { changes } = await run("DELETE FROM todos WHERE id = ?", [id]);
    return changes > 0;
  },

  async clearCompleted() {
    const { changes } = await run("DELETE FROM todos WHERE completed = 1");
    return changes;
  },

  async countByMonth(year, month) {
    const rows = await all(
      `SELECT due_date, COUNT(*) AS count
       FROM todos
       WHERE due_date IS NOT NULL
         AND strftime('%Y', due_date) = ?
         AND strftime('%m', due_date) = ?
       GROUP BY due_date`,
      [String(year), pad2(month)],
    );
    const map = {};
    rows.forEach((r) => {
      map[r.due_date] = r.count;
    });
    return map;
  },

  async listLocations() {
    const rows = await all(
      `SELECT DISTINCT location FROM todos
       WHERE location IS NOT NULL AND location != ''
       ORDER BY location COLLATE NOCASE`,
    );
    return rows.map((r) => r.location);
  },

  // ----- NUOVI METODI DI ELIMINAZIONE DI MASSA -----

  clearAll() {
    return run("DELETE FROM todos");
  },

  clearActive() {
    return run("DELETE FROM todos WHERE completed = 0");
  },

  clearFiltered({
    completed,
    priority,
    search,
    location,
    date,
    dates,
    year,
    month,
  } = {}) {
    let sql = "DELETE FROM todos WHERE 1=1";
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
    if (location) {
      sql += " AND location = ?";
      params.push(location);
    }

    if (dates && dates.length > 0) {
      sql += ` AND due_date IN (${dates.map(() => "?").join(",")})`;
      params.push(...dates);
    } else if (date) {
      sql += " AND due_date = ?";
      params.push(date);
    } else {
      if (year) {
        sql += " AND strftime('%Y', due_date) = ?";
        params.push(String(year));
      }
      if (month) {
        sql += " AND strftime('%m', due_date) = ?";
        params.push(pad2(month));
      }
    }

    return run(sql, params);
  },
};

module.exports = TodoModel;
