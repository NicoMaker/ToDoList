import { useState } from "react";
import PrioritySegment from "./PrioritySegment";
import { IconPlus, IconPin, IconCalendar } from "../icons/Icons";

/**
 * Form "Nuova attività". Gestisce internamente i propri campi
 * e chiama onCreate({ title, description, priority, due_date, location })
 * al submit. defaultDate, se passato, precompila il campo data
 * (usato quando l'utente crea un'attività da un giorno del calendario).
 */
export default function AddTodoForm({ onCreate, defaultDate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("media");
  const [dueDate, setDueDate] = useState(defaultDate || "");
  const [location, setLocation] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const ok = await onCreate({
      title,
      description,
      priority,
      due_date: dueDate || null,
      location,
    });
    if (ok) {
      setTitle("");
      setDescription("");
      setPriority("media");
      setDueDate(defaultDate || "");
      setLocation("");
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

        <div className="form-row">
          <label className="field-with-icon">
            <IconCalendar />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="Data di scadenza"
            />
          </label>
          <label className="field-with-icon">
            <IconPin />
            <input
              type="text"
              placeholder="Luogo (es. Ufficio, Casa…)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Luogo dell'attività"
            />
          </label>
        </div>

        <PrioritySegment value={priority} onChange={setPriority} />
        <button type="submit" className="btn btn-primary">
          <IconPlus />
          Aggiungi attività
        </button>
      </form>
    </section>
  );
}
