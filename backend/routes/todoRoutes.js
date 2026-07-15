// ============================================================
// routes/todoRoutes.js — Mappa URL → controller
// Montato su /api/todos in app.js
// ============================================================
const { Router } = require("express");
const todoController = require("../controllers/todoController");

const router = Router();

router.get("/", todoController.list);

// NB: le rotte con prefisso fisso devono stare PRIMA di "/:id",
// altrimenti "clear" o "meta" verrebbero letti come id.
router.delete("/clear/completed", todoController.clearCompleted);
router.get("/meta/locations", todoController.listLocations);
router.get("/meta/calendar", todoController.calendarCounts);

router.get("/:id", todoController.getOne);
router.post("/", todoController.create);
router.put("/:id", todoController.update);
router.patch("/:id/toggle", todoController.toggle);
router.delete("/:id", todoController.remove);

module.exports = router;
