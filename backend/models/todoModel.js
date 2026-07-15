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

/** "5" -> "05" (per confrontare il mese con strftime, che è sempre a 2 cifre) */
function pad2(n) {
  return String(n).padStart(2, "0");
}

const TodoModel = {
  /**
   * Lista con filtri opzionali:
   * - completed, priority, search (esistenti)
   * - location: luogo esatto in cui è stata creata l'attività
   * - date: giorno esatto di scadenza, formato YYYY-MM-DD
   * - year, month: filtra per mese/anno di scadenza (month 1-12), usati
   *   dalla vista calendario quando non è selezionato un giorno preciso
   */
  findAll({ completed, priority, search, location, date, year, month } = {}) {
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
    if (date) {
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

  /** Singolo todo per id (undefined se non esiste) */
  findById(id) {
    return get("SELECT * FROM todos WHERE id = ?", [id]);
  },

  /** Crea un todo e ritorna la riga appena inserita */
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

  /**
   * Aggiorna un todo esistente (i campi non passati restano invariati).
   * Ritorna la riga aggiornata, o null se l'id non esiste.
   */
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

  /**
   * Conteggio attività per giorno in un dato mese, per popolare i puntini
   * nel calendario. Ritorna un oggetto { "YYYY-MM-DD": numero }.
   */
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

  /** Elenco dei luoghi distinti già usati, per il filtro a tendina. */
  async listLocations() {
    const rows = await all(
      `SELECT DISTINCT location FROM todos
       WHERE location IS NOT NULL AND location != ''
       ORDER BY location COLLATE NOCASE`,
    );
    return rows.map((r) => r.location);
  },
};

module.exports = TodoModel;
