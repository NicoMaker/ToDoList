// ============================================================
// routes/todoRoutes.js — Mappa URL → controller
// ============================================================
const { Router } = require("express");
const todoController = require("../controllers/todoController");

const router = Router();

// Rotte di lista e metadati
router.get("/", todoController.list);
router.get("/meta/locations", todoController.listLocations);
router.get("/meta/calendar", todoController.calendarCounts);

// Rotte di eliminazione di massa (vanno PRIMA di "/:id")
router.delete("/clear/all", todoController.clearAll);
router.delete("/clear/active", todoController.clearActive);
router.delete("/clear/filtered", todoController.clearFiltered);
router.delete("/clear/completed", todoController.clearCompleted);

// Rotte singole (con parametro id)
router.get("/:id", todoController.getOne);
router.post("/", todoController.create);
router.put("/:id", todoController.update);
router.patch("/:id/toggle", todoController.toggle);
router.delete("/:id", todoController.remove);

module.exports = router;
