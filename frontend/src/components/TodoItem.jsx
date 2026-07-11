import { useState } from "react";
import PrioritySegment from "./PrioritySegment";
import { IconCheck, IconEdit, IconTrash } from "./Icons";

/**
 * Singola attività: checkbox, testo, chip priorità e azioni.
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

  const startEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setEditPriority(todo.priority || "media");
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!editTitle.trim()) return;
    const ok = await onUpdate(todo.id, {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
    });
    if (ok) setIsEditing(false);
  };

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
            <span className="todo-date">
              {new Date(todo.created_at).toLocaleDateString("it-IT", {
                day: "numeric",
                month: "short",
              })}
              {" · "}
              {new Date(todo.created_at).toLocaleTimeString("it-IT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
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
