import { useEffect, useRef } from "react";

/**
 * Finestra di conferma per azioni distruttive (eliminazioni).
 * Si chiude con "Annulla", cliccando lo sfondo o premendo ESC.
 *
 * Props:
 * - open: se mostrare la finestra
 * - title: titolo della finestra
 * - message: testo esplicativo
 * - confirmLabel: etichetta del pulsante di conferma (es. "Elimina")
 * - onConfirm: chiamata alla conferma
 * - onCancel: chiamata all'annullamento
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Elimina",
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);

  // ESC per chiudere + focus iniziale su "Annulla" (scelta sicura)
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
      >
        <div className="dialog-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
            <path
              d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 id="dialog-title" className="dialog-title">
          {title}
        </h3>
        <p id="dialog-message" className="dialog-message">
          {message}
        </p>
        <div className="dialog-actions">
          <button ref={cancelRef} className="btn btn-ghost" onClick={onCancel}>
            Annulla
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
