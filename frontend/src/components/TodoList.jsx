import TodoItem from "./TodoItem";

/**
 * Lista delle attività. Mostra anche caricamento e stato vuoto
 * (con messaggio diverso se ci sono filtri o ricerca attivi).
 */
export default function TodoList({
  todos,
  loading,
  isFiltered,
  onToggle,
  onDelete,
  onUpdate,
}) {
  if (loading) {
    return (
      <div className="todo-list">
        <p className="empty-state">Caricamento in corso…</p>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="todo-list">
        <div className="empty-state">
          <div className="empty-emoji" aria-hidden="true">
            ✨
          </div>
          <p className="empty-title">
            {isFiltered ? "Nessuna attività trovata" : "Tutto libero!"}
          </p>
          <p className="empty-sub">
            {isFiltered
              ? "Prova a cambiare la ricerca o il filtro."
              : "Aggiungi la tua prima attività per iniziare."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map((todo, i) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          index={i}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
