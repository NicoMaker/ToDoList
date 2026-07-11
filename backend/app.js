// ============================================================
// app.js — Configurazione dell'app Express
// Middleware globali + montaggio delle rotte.
// (L'avvio del server è in server.js)
// ============================================================
const express = require("express");
const cors = require("cors");

const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");
const todoRoutes = require("./routes/todoRoutes");

const app = express();

// Middleware globali
app.use(cors());
app.use(express.json());
app.use(logger);

// Rotte
app.use("/api/todos", todoRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Todo API attiva su /api/todos" });
});

// Gestione errori (sempre per ultimo)
app.use(errorHandler);

module.exports = app;
