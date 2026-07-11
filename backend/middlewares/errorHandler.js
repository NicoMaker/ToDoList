// ============================================================
// middlewares/errorHandler.js — Gestione centralizzata errori
// Qualsiasi next(err) nei controller finisce qui.
// ============================================================
function errorHandler(err, req, res, next) {
  console.error("Errore:", err.message);
  res.status(500).json({ error: err.message || "Errore interno del server" });
}

module.exports = errorHandler;
