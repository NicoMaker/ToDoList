import { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import Header from "./components/layout/Header";
import AddTodoForm from "./components/tasks/AddTodoForm";
import ProgressCard from "./components/feedback/ProgressCard";
import CalendarPanel from "./components/calendar/CalendarPanel";
import Toolbar from "./components/toolbar/Toolbar";
import TodoList from "./components/tasks/TodoList";
import ConfirmDialog from "./components/feedback/ConfirmDialog";

/**
 * App: unica fonte di verità per i dati.
 * Tiene lo stato (todos, filtri, errori), parla con l'API e
 * passa dati + callback ai componenti figli.
 */
export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("tutti"); // tutti | attivi | completati
  const [search, setSearch] = useState("");

  // Filtro luogo (dove è stata creata l'attività) + elenco per la tendina
  const [locationFilter, setLocationFilter] = useState("");
  const [locations, setLocations] = useState([]);

  // Filtro data dal calendario: { year, month, day|null, iso? } oppure null
  const [dateFilter, setDateFilter] = useState(null);

  const loadLocations = useCallback(async () => {
    try {
      const data = await api.getLocations();
      setLocations(data);
    } catch {
      // Non blocchiamo l'app se il filtro luoghi non si carica
    }
  }, []);

  const loadTodos = useCallback(async () => {
    setError("");
    try {
      const params = {};
      if (filter === "attivi") params.completed = "false";
      if (filter === "completati") params.completed = "true";
      if (search.trim()) params.search = search.trim();
      if (locationFilter) params.location = locationFilter;

      if (dateFilter) {
        if (dateFilter.type === "days") {
          params.dates = dateFilter.dates.join(",");
        } else if (dateFilter.type === "month") {
          params.year = dateFilter.year;
          params.month = dateFilter.month;
        }
      }

      const data = await api.getAll(params);
      setTodos(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter, search, locationFilter, dateFilter]);

  useEffect(() => {
    const t = setTimeout(loadTodos, 250); // debounce ricerca
    return () => clearTimeout(t);
  }, [loadTodos]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  /** Esegue un'azione API, ricarica la lista e ritorna true se ok. */
  const run = async (action) => {
    try {
      await action();
      await Promise.all([loadTodos(), loadLocations()]);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  };

  const handleCreate = (todo) => run(() => api.create(todo));
  const handleToggle = (id) => run(() => api.toggle(id));
  const handleUpdate = (id, fields) => run(() => api.update(id, fields));

  // ---- Eliminazioni con conferma ----
  // confirm = null oppure { title, message, confirmLabel, action }
  const [confirm, setConfirm] = useState(null);

  const askDelete = (todo) =>
    setConfirm({
      title: "Eliminare questa attività?",
      message: `"${todo.title}" verrà eliminata definitivamente. L'operazione non si può annullare.`,
      confirmLabel: "Elimina",
      action: () => api.remove(todo.id),
    });

  const askClearCompleted = () =>
    setConfirm({
      title: "Eliminare le attività completate?",
      message: `${completedCount} attività completate verranno eliminate definitivamente. L'operazione non si può annullare.`,
      confirmLabel: "Elimina tutte",
      action: () => api.clearCompleted(),
    });

  const handleConfirm = async () => {
    const { action } = confirm;
    setConfirm(null);
    await run(action);
  };

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;
  const isFiltered =
    filter !== "tutti" ||
    search.trim() !== "" ||
    locationFilter !== "" ||
    dateFilter !== null;

  return (
    <div className="app">
      <div className="bg-blob blob-a" aria-hidden="true" />
      <div className="bg-blob blob-b" aria-hidden="true" />

      <Header />

      <div className="board">
        <aside className="side-panel">
          <AddTodoForm
            onCreate={handleCreate}
            defaultDate={
              dateFilter?.type === "days" && dateFilter.dates.length === 1
                ? dateFilter.dates[0]
                : ""
            }
          />
          <CalendarPanel selected={dateFilter} onSelect={setDateFilter} />
          <ProgressCard
            activeCount={activeCount}
            completedCount={completedCount}
            onClearCompleted={askClearCompleted}
          />
        </aside>

        <main className="task-area">
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            locations={locations}
            locationFilter={locationFilter}
            onLocationFilterChange={setLocationFilter}
          />

          {error && (
            <div className="error-banner" role="alert">
              Qualcosa è andato storto: {error}
            </div>
          )}

          <TodoList
            todos={todos}
            loading={loading}
            isFiltered={isFiltered}
            onToggle={handleToggle}
            onDelete={askDelete}
            onUpdate={handleUpdate}
          />
        </main>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
