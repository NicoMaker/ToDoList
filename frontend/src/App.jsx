import React, { useState, useEffect, useCallback } from "react";
import { api } from "./api";

const PRIORITIES = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "bassa", label: "Bassa" },
];

function todayLabel() {
  const s = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ---- Icone SVG ---- */
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16" aria-hidden="true">
    <path
      d="M16.5 4.5l3 3L8 19l-4 1 1-4L16.5 4.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16" aria-hidden="true">
    <path
      d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" width="17" height="17" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path
      d="M21 21l-4.3-4.3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" aria-hidden="true">
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

/* ---- Anello di avanzamento ---- */
function ProgressRing({ done, total }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const R = 34;
  const C = 2 * Math.PI * R;
  return (
    <div className="progress-ring" role="img" aria-label={`${pct}% completato`}>
      <svg viewBox="0 0 84 84">
        <circle className="ring-track" cx="42" cy="42" r={R} />
        <circle
          className="ring-value"
          cx="42"
          cy="42"
          r={R}
          strokeDasharray={C}
          strokeDashoffset={C - (C * pct) / 100}
        />
      </svg>
      <div className="ring-center">
        <span className="ring-pct">{pct}%</span>
      </div>
    </div>
  );
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("media");

  const [filter, setFilter] = useState("tutti"); // tutti | attivi | completati
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("media");

  const loadTodos = useCallback(async () => {
    setError("");
    try {
      const params = {};
      if (filter === "attivi") params.completed = "false";
      if (filter === "completati") params.completed = "true";
      if (search.trim()) params.search = search.trim();
      const data = await api.getAll(params);
      setTodos(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    const t = setTimeout(loadTodos, 250); // debounce ricerca
    return () => clearTimeout(t);
  }, [loadTodos]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.create({ title, description, priority });
      setTitle("");
      setDescription("");
      setPriority("media");
      loadTodos();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.toggle(id);
      loadTodos();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.remove(id);
      loadTodos();
    } catch (e) {
      setError(e.message);
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setEditPriority(todo.priority || "media");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditPriority("media");
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return;
    try {
      await api.update(id, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
      });
      cancelEdit();
      loadTodos();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleClearCompleted = async () => {
    try {
      await api.clearCompleted();
      loadTodos();
    } catch (e) {
      setError(e.message);
    }
  };

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="app">
      <div className="bg-blob blob-a" aria-hidden="true" />
      <div className="bg-blob blob-b" aria-hidden="true" />

      <header className="masthead">
        <div>
          <p className="masthead-date">{todayLabel()}</p>
          <h1 className="masthead-title">Le mie attività</h1>
        </div>
      </header>

      <div className="board">
        {/* ---- Colonna laterale ---- */}
        <aside className="side-panel">
          <section className="panel-card">
            <h2 className="panel-label">Nuova attività</h2>
            <form className="add-form" onSubmit={handleCreate}>
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
              <div
                className="priority-segment"
                role="radiogroup"
                aria-label="Priorità"
              >
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    role="radio"
                    aria-checked={priority === p.value}
                    className={`segment-btn prio-${p.value} ${
                      priority === p.value ? "active" : ""
                    }`}
                    onClick={() => setPriority(p.value)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button type="submit" className="btn btn-primary">
                <IconPlus />
                Aggiungi attività
              </button>
            </form>
          </section>

          <section className="panel-card progress-card">
            <h2 className="panel-label">I tuoi progressi</h2>
            <div className="progress-row">
              <ProgressRing done={completedCount} total={todos.length} />
              <div className="stats-col">
                <div className="stat">
                  <span className="stat-num">{activeCount}</span>
                  <span className="stat-label">da fare</span>
                </div>
                <div className="stat">
                  <span className="stat-num">{completedCount}</span>
                  <span className="stat-label">completate</span>
                </div>
              </div>
            </div>
            {completedCount > 0 && (
              <button className="btn-link" onClick={handleClearCompleted}>
                Elimina le attività completate
              </button>
            )}
          </section>
        </aside>

        {/* ---- Colonna principale ---- */}
        <main className="task-area">
          <div className="toolbar">
            <div className="search-box">
              <IconSearch />
              <input
                type="text"
                placeholder="Cerca tra le attività…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Cerca attività"
              />
            </div>
            <div className="filters" role="tablist" aria-label="Filtra attività">
              {[
                ["tutti", "Tutte"],
                ["attivi", "Da fare"],
                ["completati", "Completate"],
              ].map(([f, label]) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={filter === f}
                  className={`filter-btn ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-banner" role="alert">
              Qualcosa è andato storto: {error}
            </div>
          )}

          <div className="todo-list">
            {loading && <p className="empty-state">Caricamento in corso…</p>}

            {!loading && todos.length === 0 && (
              <div className="empty-state">
                <div className="empty-emoji" aria-hidden="true">
                  ✨
                </div>
                <p className="empty-title">
                  {search || filter !== "tutti"
                    ? "Nessuna attività trovata"
                    : "Tutto libero!"}
                </p>
                <p className="empty-sub">
                  {search || filter !== "tutti"
                    ? "Prova a cambiare la ricerca o il filtro."
                    : "Aggiungi la tua prima attività per iniziare."}
                </p>
              </div>
            )}

            {!loading &&
              todos.map((todo, i) => {
                const isEditing = editingId === todo.id;
                return (
                  <article
                    key={todo.id}
                    className={`todo-card prio-border-${todo.priority || "media"} ${
                      todo.completed ? "completed" : ""
                    }`}
                    style={{ "--i": i }}
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
                          <div
                            className="priority-segment small"
                            role="radiogroup"
                            aria-label="Priorità"
                          >
                            {PRIORITIES.map((p) => (
                              <button
                                key={p.value}
                                type="button"
                                role="radio"
                                aria-checked={editPriority === p.value}
                                className={`segment-btn prio-${p.value} ${
                                  editPriority === p.value ? "active" : ""
                                }`}
                                onClick={() => setEditPriority(p.value)}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                          <div className="edit-actions">
                            <button
                              className="btn btn-primary"
                              onClick={() => saveEdit(todo.id)}
                            >
                              Salva
                            </button>
                            <button className="btn btn-ghost" onClick={cancelEdit}>
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
                          onClick={() => handleToggle(todo.id)}
                        >
                          <IconCheck />
                        </button>

                        <div className="todo-text">
                          <div className="todo-title-row">
                            <span className="todo-title">{todo.title}</span>
                            <span
                              className={`priority-chip chip-${
                                todo.priority || "media"
                              }`}
                            >
                              {todo.priority || "media"}
                            </span>
                          </div>
                          {todo.description && (
                            <p className="todo-description">{todo.description}</p>
                          )}
                          <span className="todo-date">
                            {new Date(todo.created_at).toLocaleDateString(
                              "it-IT",
                              { day: "numeric", month: "short" },
                            )}
                            {" · "}
                            {new Date(todo.created_at).toLocaleTimeString(
                              "it-IT",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        </div>

                        <div className="todo-actions">
                          <button
                            className="icon-btn"
                            onClick={() => startEdit(todo)}
                            title="Modifica"
                            aria-label={`Modifica "${todo.title}"`}
                          >
                            <IconEdit />
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={() => handleDelete(todo.id)}
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
              })}
          </div>
        </main>
      </div>
    </div>
  );
}
