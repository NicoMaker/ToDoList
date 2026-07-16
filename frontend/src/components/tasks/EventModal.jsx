import { useEffect } from "react";
import AddTodoForm from "./AddTodoForm";
import { IconX } from "../icons/Icons";

/**
 * Finestra modale separata per creare una nuova attività, aperta dal
 * bottone "Nuovo evento". Si chiude con la X, cliccando lo sfondo,
 * premendo ESC, oppure automaticamente dopo una creazione riuscita.
 *
 * Props:
 * - open: se mostrare la finestra
 * - onClose: chiamata alla chiusura
 * - onCreate(todo): come per AddTodoForm, deve ritornare true/false
 * - defaultDate: precompila la data (es. giorno scelto nel calendario)
 */
export default function EventModal({ open, onClose, onCreate, defaultDate }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleCreate = async (todo) => {
    const ok = await onCreate(todo);
    if (ok) onClose();
    return ok;
  };

  return (
    <div
      className="dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal event-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Nuovo evento"
      >
        <button
          type="button"
          className="icon-btn modal-close"
          onClick={onClose}
          aria-label="Chiudi finestra"
        >
          <IconX />
        </button>
        <AddTodoForm
          onCreate={handleCreate}
          defaultDate={defaultDate}
          title="Nuovo evento"
          submitLabel="Crea attività"
          bare
        />
      </div>
    </div>
  );
}
