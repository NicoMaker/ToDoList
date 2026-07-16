const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "todos.db");

const db = new sqlite3.Database(DB_PATH);

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function migrate() {
  try {
    // Crea tabella se non esiste
    await runAsync(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        completed INTEGER DEFAULT 0,
        priority TEXT DEFAULT 'media',
        due_date TEXT DEFAULT NULL,
        location TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Aggiunge le colonne mancanti (migrazioni)
    const columns = await allAsync("PRAGMA table_info(todos)");
    const columnNames = columns.map((c) => c.name);

    if (!columnNames.includes("due_date")) {
      await runAsync("ALTER TABLE todos ADD COLUMN due_date TEXT DEFAULT NULL");
      console.log('Colonna "due_date" aggiunta.');
    }
    if (!columnNames.includes("location")) {
      await runAsync("ALTER TABLE todos ADD COLUMN location TEXT DEFAULT ''");
      console.log('Colonna "location" aggiunta.');
    }

    console.log("Migrazione completata.");
  } catch (err) {
    console.error("Errore migrazione:", err.message);
    throw err;
  }
}

const migrationPromise = migrate();

module.exports = { db, migrationPromise };
