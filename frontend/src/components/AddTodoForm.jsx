import { useState } from "react";
import PrioritySegment from "./PrioritySegment";
import { IconPlus } from "./Icons";

/**
 * Form "Nuova attività". Gestisce internamente i propri campi
 * e chiama onCreate({ title, description, priority }) al submit.
 */
export default function AddTodoForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("media");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const ok = await onCreate({ title, description, priority });
    if (ok) {
      setTitle("");
      setDescription("");
      setPriority("media");
    }
  };

  return (
    <section className="panel-card">
      <h2 className="panel-label">Nuova attività</h2>
      <form className="add-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Cosa devi fare?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Titolo attività"
        />
        <input
          type="text"
          placeholder="Aggiungi una nota (opzionale)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-label="Descrizione attività"
        />
        <PrioritySegment value={priority} onChange={setPriority} />
        <button type="submit" className="btn btn-primary">
          <IconPlus />
          Aggiungi attività
        </button>
      </form>
    </section>
  );
}
