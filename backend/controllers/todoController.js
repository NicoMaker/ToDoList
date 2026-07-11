// ============================================================
// controllers/todoController.js — Logica delle richieste HTTP
// Valida l'input, chiama il model e costruisce la risposta.
// Gli errori vengono passati a next() → errorHandler.
// ============================================================
const TodoModel = require("../models/todoModel");

const todoController = {
  /** GET /api/todos — lista con filtri (completed, priority, search) */
  async list(req, res, next) {
    try {
      const todos = await TodoModel.findAll(req.query);
      res.json(todos);
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/todos/:id — dettaglio singolo */
  async getOne(req, res, next) {
    try {
      const todo = await TodoModel.findById(req.params.id);
      if (!todo) return res.status(404).json({ error: "Todo non trovato" });
      res.json(todo);
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/todos — crea nuovo todo */
  async create(req, res, next) {
    try {
      const { title, description, priority } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ error: "Il titolo è obbligatorio" });
      }
      const todo = await TodoModel.create({
        title: title.trim(),
        description,
        priority,
      });
      res.status(201).json(todo);
    } catch (err) {
      next(err);
    }
  },

  /** PUT /api/todos/:id — aggiorna un todo esistente */
  async update(req, res, next) {
    try {
      const todo = await TodoModel.update(req.params.id, req.body);
      if (!todo) return res.status(404).json({ error: "Todo non trovato" });
      res.json(todo);
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /api/todos/:id/toggle — inverte completato/da fare */
  async toggle(req, res, next) {
    try {
      const todo = await TodoModel.toggle(req.params.id);
      if (!todo) return res.status(404).json({ error: "Todo non trovato" });
      res.json(todo);
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/todos/:id — elimina un todo */
  async remove(req, res, next) {
    try {
      const deleted = await TodoModel.remove(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Todo non trovato" });
      res.json({
        message: "Todo eliminato con successo",
        id: Number(req.params.id),
      });
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/todos/clear/completed — elimina tutti i completati */
  async clearCompleted(req, res, next) {
    try {
      const count = await TodoModel.clearCompleted();
      res.json({ message: "Todo completati eliminati", count });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = todoController;
