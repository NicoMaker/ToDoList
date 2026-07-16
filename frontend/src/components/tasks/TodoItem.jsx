import { useState } from "react";
import PrioritySegment from "./PrioritySegment";
import { IconCheck, IconEdit, IconTrash, IconPin, IconCalendar } from "../icons/Icons";

/** Formatta una data YYYY-MM-DD in "gg mese" leggibile, in italiano */
function formatDueDate(dueDate) {
  if (!dueDate) return null;
  const d = new Date(`${dueDate}T00:00:00`);
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

/**
 * Singola attività: checkbox, testo, chip priorità, luogo/scadenza e azioni.
 * La modalità modifica è gestita internamente: al salvataggio
 * chiama onUpdate(id, campi).
 *
 * Props:
 * - todo: l'attività da mostrare
 * - index: posizione nella lista (per l'animazione a cascata)
 * - onToggle(id), onDelete(todo), onUpdate(id, campi)
 */
export default function TodoItem({
  todo,
  index,
  onToggle,
  onDelete,
  onUpdate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("media");
  const [editDueDate, setEditDueDate] = useState("");
  const [editLocation, setEditLocation] = useState("");

  const startEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setEditPriority(todo.priority || "media");
    setEditDueDate(todo.due_date || "");
    setEditLocation(todo.location || "");
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!editTitle.trim()) return;
    const ok = await onUpdate(todo.id, {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      due_date: editDueDate || null,
      location: editLocation,
    });
    if (ok) setIsEditing(false);
  };

  const dueLabel = formatDueDate(todo.due_date);

  return (
    <article
      className={`todo-card prio-border-${todo.priority || "media"} ${
        todo.completed ? "completed" : ""
      }`}
      style={{ "--i": index }}
    >
      {isEditing ? (
        <div className="edit-mode">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            autoFocus
            aria-label="Modifica titolo"
          />
          <input
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Nota"
            aria-label="Modifica descrizione"
          />
          <div className="form-row">
            <label className="field-with-icon">
              <IconCalendar />
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                aria-label="Modifica data di scadenza"
              />
            </label>
            <label className="field-with-icon">
              <IconPin />
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="Luogo"
                aria-label="Modifica luogo"
              />
            </label>
          </div>
          <div className="edit-footer">
            <PrioritySegment
              value={editPriority}
              onChange={setEditPriority}
              small
            />
            <div className="edit-actions">
              <button className="btn btn-primary" onClick={saveEdit}>
                Salva
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setIsEditing(false)}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <button
            className="check"
            role="checkbox"
            aria-checked={!!todo.completed}
            aria-label={
              todo.completed
                ? `Riapri "${todo.title}"`
                : `Completa "${todo.title}"`
            }
            onClick={() => onToggle(todo.id)}
          >
            <IconCheck />
          </button>

          <div className="todo-text">
            <div className="todo-title-row">
              <span className="todo-title">{todo.title}</span>
              <span
                className={`priority-chip chip-${todo.priority || "media"}`}
              >
                {todo.priority || "media"}
              </span>
            </div>
            {todo.description && (
              <p className="todo-description">{todo.description}</p>
            )}

            <div className="todo-meta-row">
              {dueLabel && (
                <span className="meta-chip meta-date">
                  <IconCalendar width={12} height={12} />
                  {dueLabel}
                </span>
              )}
              {todo.location && (
                <span className="meta-chip meta-location">
                  <IconPin width={12} height={12} />
                  {todo.location}
                </span>
              )}
              <span className="todo-date">
                Creato il{" "}
                {new Date(todo.created_at).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          </div>

          <div className="todo-actions">
            <button
              className="icon-btn"
              onClick={startEdit}
              title="Modifica"
              aria-label={`Modifica "${todo.title}"`}
            >
              <IconEdit />
            </button>
            <button
              className="icon-btn danger"
              onClick={() => onDelete(todo)}
              title="Elimina"
              aria-label={`Elimina "${todo.title}"`}
            >
              <IconTrash />
            </button>
          </div>
        </>
      )}
    </article>
  );
}
