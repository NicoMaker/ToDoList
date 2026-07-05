import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';

const PRIORITIES = [
  { value: 'alta', label: 'Alta', color: '#a6392c' },
  { value: 'media', label: 'Media', color: '#b9832e' },
  { value: 'bassa', label: 'Bassa', color: '#5f7a52' },
];

function priorityMeta(value) {
  return PRIORITIES.find((p) => p.value === value) || PRIORITIES[1];
}

function caseNumber(id) {
  return `N. ${String(id).padStart(3, '0')}`;
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('media');

  const [filter, setFilter] = useState('tutti'); // tutti | attivi | completati
  const [search, setSearch] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('media');

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filter === 'attivi') params.completed = 'false';
      if (filter === 'completati') params.completed = 'true';
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
      setTitle('');
      setDescription('');
      setPriority('media');
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
    setEditDescription(todo.description || '');
    setEditPriority(todo.priority || 'media');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setEditPriority('media');
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
      <header className="masthead">
        <h1 className="masthead-title">
          Il <span className="mark">Docket</span>
        </h1>
        <span className="masthead-sub">Registro delle pratiche aperte</span>
      </header>

      <div className="board">
        {/* ---- Colonna laterale: nuova pratica + statistiche ---- */}
        <aside className="side-panel">
          <div className="panel-card">
            <span className="panel-label">Apri nuova pratica</span>
            <form className="add-form" onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="Cosa devi fare?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Descrizione (opzionale)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    Priorità: {p.label}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary">
                + Registra pratica
              </button>
            </form>
          </div>

          <div className="panel-card">
            <span className="panel-label">Riepilogo</span>
            <div className="stats-grid">
              <div className="stat">
                <span className="stat-num">{activeCount}</span>
                <span className="stat-label">Da fare</span>
              </div>
              <div className="stat">
                <span className="stat-num">{completedCount}</span>
                <span className="stat-label">Evase</span>
              </div>
            </div>
            {completedCount > 0 && (
              <div className="clear-completed-row">
                <button className="btn-link" onClick={handleClearCompleted}>
                  Archivia ed elimina le evase
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ---- Colonna principale: il docket ---- */}
        <main className="docket">
          <div className="toolbar">
            <input
              type="text"
              placeholder="Cerca nel docket..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-search"
            />
            <div className="filters">
              {['tutti', 'attivi', 'completati'].map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="error-banner">Attenzione — {error}</div>}

          <div className="todo-list">
            {loading && <p className="empty-state">Consultazione del registro in corso...</p>}
            {!loading && todos.length === 0 && (
              <p className="empty-state">Il docket è vuoto. Registra la prima pratica.</p>
            )}

            {!loading &&
              todos.map((todo) => {
                const meta = priorityMeta(todo.priority);
                const isEditing = editingId === todo.id;

                return (
                  <div key={todo.id} className={`todo-card ${todo.completed ? 'completed' : ''}`}>
                    {todo.completed && <span className="stamp-evaso">EVASO</span>}

                    {isEditing ? (
                      <div className="edit-mode">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                        />
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Descrizione"
                        />
                        <div className="form-row">
                          <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value)}
                          >
                            {PRIORITIES.map((p) => (
                              <option key={p.value} value={p.value}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                          <button className="btn btn-primary" onClick={() => saveEdit(todo.id)}>
                            Salva
                          </button>
                          <button className="btn btn-ghost" onClick={cancelEdit}>
                            Annulla
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="todo-main">
                          <div className="checkbox-wrap">
                            <input
                              type="checkbox"
                              checked={!!todo.completed}
                              onChange={() => handleToggle(todo.id)}
                              className="checkbox"
                              aria-label="Segna come evasa"
                            />
                          </div>
                          <div className="todo-text">
                            <span className="case-number">{caseNumber(todo.id)}</span>
                            <div className="todo-title-row">
                              <span className="todo-title">{todo.title}</span>
                              <span
                                className="priority-seal"
                                style={{ backgroundColor: meta.color }}
                              >
                                {meta.label}
                              </span>
                            </div>
                            {todo.description && (
                              <p className="todo-description">{todo.description}</p>
                            )}
                            <span className="todo-date">
                              Aperta il {new Date(todo.created_at).toLocaleString('it-IT')}
                            </span>
                          </div>
                        </div>
                        <div className="todo-actions">
                          <button
                            className="icon-btn"
                            onClick={() => startEdit(todo)}
                            title="Modifica pratica"
                            aria-label="Modifica"
                          >
                            ✎
                          </button>
                          <button
                            className="icon-btn"
                            onClick={() => handleDelete(todo.id)}
                            title="Elimina pratica"
                            aria-label="Elimina"
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
          </div>
        </main>
      </div>
    </div>
  );
}