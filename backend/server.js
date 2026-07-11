// ============================================================
// server.js — Punto di ingresso: avvia il server HTTP
// ============================================================
const app = require("./app");

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
