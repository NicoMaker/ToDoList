// ============================================================
// config/database.js — Connessione SQLite + schema + migrazioni
// Le migrazioni aggiungono le colonne nuove (due_date, location)
// anche a un database creato da una versione precedente dell'app,
// senza perdere i dati già presenti.
// ============================================================
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "todos.db");

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Errore apertura database:", err.message);
  } else {
    console.log("Connesso al database SQLite:", DB_PATH);
  }
});

/** Aggiunge una colonna solo se non esiste già (SQLite non supporta
 *  "ADD COLUMN IF NOT EXISTS" su tutte le versioni, quindi controlliamo
 *  manualmente leggendo lo schema della tabella). */
function ensureColumn(table, column, definition) {
  db.all(`PRAGMA table_info(${table})`, [], (err, rows) => {
    if (err) return console.error("Errore lettura schema:", err.message);
    const exists = rows.some((r) => r.name === column);
    if (!exists) {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (e) => {
        if (e) console.error(`Errore aggiunta colonna ${column}:`, e.message);
        else console.log(`Colonna "${column}" aggiunta a "${table}".`);
      });
    }
  });
}

db.serialize(() => {
  db.run(`
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

  // Migrazione per database già esistenti creati prima di queste colonne
  ensureColumn("todos", "due_date", "TEXT DEFAULT NULL");
  ensureColumn("todos", "location", "TEXT DEFAULT ''");
});

module.exports = db;
