// ============================================================
// controllers/todoController.js — Logica delle richieste HTTP
// ============================================================
const TodoModel = require("../models/todoModel");

/** Verifica che una stringa sia una data valida in formato YYYY-MM-DD */
function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

const todoController = {
  // ----- METODI ESISTENTI -----

  /** GET /api/todos — lista con filtri */
  async list(req, res, next) {
    try {
      const {
        completed,
        priority,
        search,
        location,
        date,
        dates,
        year,
        month,
      } = req.query;

      if (date && !isValidDate(date)) {
        return res
          .status(400)
          .json({ error: "Il parametro date deve avere formato YYYY-MM-DD" });
      }

      let datesArr;
      if (dates) {
        datesArr = String(dates)
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean);
        const invalid = datesArr.find((d) => !isValidDate(d));
        if (invalid) {
          return res.status(400).json({
            error: `Data non valida in "dates": ${invalid} (atteso YYYY-MM-DD)`,
          });
        }
      }

      const todos = await TodoModel.findAll({
        completed,
        priority,
        search,
        location,
        date,
        dates: datesArr,
        year,
        month,
      });
      res.json(todos);
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/todos/meta/locations */
  async listLocations(req, res, next) {
    try {
      const locations = await TodoModel.listLocations();
      res.json(locations);
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/todos/meta/calendar */
  async calendarCounts(req, res, next) {
    try {
      const { year, month } = req.query;
      if (!year || !month) {
        return res.status(400).json({ error: "year e month sono obbligatori" });
      }
      const counts = await TodoModel.countByMonth(year, month);
      res.json(counts);
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/todos/:id */
  async getOne(req, res, next) {
    try {
      const todo = await TodoModel.findById(req.params.id);
      if (!todo) return res.status(404).json({ error: "Todo non trovato" });
      res.json(todo);
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/todos */
  async create(req, res, next) {
    try {
      const { title, description, priority, due_date, location } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ error: "Il titolo è obbligatorio" });
      }
      if (due_date && !isValidDate(due_date)) {
        return res
          .status(400)
          .json({ error: "La data deve avere formato YYYY-MM-DD" });
      }
      const todo = await TodoModel.create({
        title: title.trim(),
        description,
        priority,
        due_date: due_date || null,
        location: location ? location.trim() : "",
      });
      res.status(201).json(todo);
    } catch (err) {
      next(err);
    }
  },

  /** PUT /api/todos/:id */
  async update(req, res, next) {
    try {
      if (req.body.due_date && !isValidDate(req.body.due_date)) {
        return res
          .status(400)
          .json({ error: "La data deve avere formato YYYY-MM-DD" });
      }
      const todo = await TodoModel.update(req.params.id, req.body);
      if (!todo) return res.status(404).json({ error: "Todo non trovato" });
      res.json(todo);
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /api/todos/:id/toggle */
  async toggle(req, res, next) {
    try {
      const todo = await TodoModel.toggle(req.params.id);
      if (!todo) return res.status(404).json({ error: "Todo non trovato" });
      res.json(todo);
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/todos/:id */
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

  /** DELETE /api/todos/clear/completed */
  async clearCompleted(req, res, next) {
    try {
      const count = await TodoModel.clearCompleted();
      res.json({ message: "Todo completati eliminati", count });
    } catch (err) {
      next(err);
    }
  },

  // ----- NUOVI METODI PER ELIMINAZIONE DI MASSA -----

  /** DELETE /api/todos/clear/all */
  async clearAll(req, res, next) {
    try {
      const { changes } = await TodoModel.clearAll();
      res.json({ message: "Tutte le attività eliminate", count: changes });
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/todos/clear/active */
  async clearActive(req, res, next) {
    try {
      const { changes } = await TodoModel.clearActive();
      res.json({ message: "Attività da fare eliminate", count: changes });
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/todos/clear/filtered */
  async clearFiltered(req, res, next) {
    try {
      const {
        completed,
        priority,
        search,
        location,
        date,
        dates,
        year,
        month,
      } = req.query;

      if (date && !isValidDate(date)) {
        return res
          .status(400)
          .json({ error: "Il parametro date deve avere formato YYYY-MM-DD" });
      }

      let datesArr;
      if (dates) {
        datesArr = String(dates)
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean);
        const invalid = datesArr.find((d) => !isValidDate(d));
        if (invalid) {
          return res.status(400).json({
            error: `Data non valida in "dates": ${invalid} (atteso YYYY-MM-DD)`,
          });
        }
      }

      const { changes } = await TodoModel.clearFiltered({
        completed,
        priority,
        search,
        location,
        date,
        dates: datesArr,
        year,
        month,
      });

      res.json({ message: "Attività filtrate eliminate", count: changes });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = todoController;
