import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "./api";
import Header from "./components/layout/Header";
import EventModal from "./components/tasks/EventModal";
import ProgressCard from "./components/feedback/ProgressCard";
import CalendarPanel from "./components/calendar/CalendarPanel";
import Toolbar from "./components/toolbar/Toolbar";
import TodoList from "./components/tasks/TodoList";
import StatsPanel from "./components/stats/StatsPanel";
import ConfirmDialog from "./components/feedback/ConfirmDialog";
import { IconPlus } from "./components/icons/Icons";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDaysISO(iso, delta) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("tutti");
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [locations, setLocations] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [focusDate, setFocusDate] = useState(todayISO);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const loadLocations = useCallback(async () => {
    try {
      const data = await api.getLocations();
      setLocations(data);
    } catch {
      // ignora
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
    const t = setTimeout(loadTodos, 250);
    return () => clearTimeout(t);
  }, [loadTodos]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

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

  const visibleTodos = useMemo(() => {
    if (priorityFilter.length === 0) return todos;
    return todos.filter((t) => priorityFilter.includes(t.priority || "media"));
  }, [todos, priorityFilter]);

  const jumpToDate = (iso) => {
    setFocusDate(iso);
    setDateFilter({ type: "days", dates: [iso] });
  };
  const shiftFocusDate = (delta) => jumpToDate(addDaysISO(focusDate, delta));
  const goToday = () => jumpToDate(todayISO());

  // ----- Azioni di massa -----
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
      message: `${completedCount} attività completate verranno eliminate definitivamente.`,
      confirmLabel: "Elimina tutte",
      action: () => api.clearCompleted(),
    });

  const askClearAll = () =>
    setConfirm({
      title: "Eliminare tutte le attività?",
      message: `Saranno eliminate tutte le ${totalCount} attività. Operazione irreversibile.`,
      confirmLabel: "Elimina tutte",
      action: () => api.clearAll(),
    });

  const askClearActive = () =>
    setConfirm({
      title: "Eliminare le attività da fare?",
      message: `${activeCount} attività non completate verranno eliminate. Continuare?`,
      confirmLabel: "Elimina da fare",
      action: () => api.clearActive(),
    });

  const askClearFiltered = () =>
    setConfirm({
      title: "Eliminare le attività filtrate?",
      message: `${visibleTodos.length} attività visibili verranno eliminate. Continuare?`,
      confirmLabel: "Elimina filtrate",
      action: () => {
        const params = {};
        if (filter === "attivi") params.completed = "false";
        if (filter === "completati") params.completed = "true";
        if (search.trim()) params.search = search.trim();
        if (locationFilter) params.location = locationFilter;
        if (dateFilter) {
          if (dateFilter.type === "days")
            params.dates = dateFilter.dates.join(",");
          else if (dateFilter.type === "month") {
            params.year = dateFilter.year;
            params.month = dateFilter.month;
          }
        }
        return api.clearFiltered(params);
      },
    });

  const handleConfirm = async () => {
    const { action } = confirm;
    setConfirm(null);
    await run(action);
  };

  const activeCount = visibleTodos.filter((t) => !t.completed).length;
  const completedCount = visibleTodos.filter((t) => t.completed).length;
  const totalCount = visibleTodos.length;
  const isFiltered =
    filter !== "tutti" ||
    search.trim() !== "" ||
    locationFilter !== "" ||
    priorityFilter.length > 0 ||
    dateFilter !== null;

  const modalDefaultDate =
    dateFilter?.type === "days" && dateFilter.dates.length === 1
      ? dateFilter.dates[0]
      : focusDate;

  return (
    <div className="app">
      <div className="bg-blob blob-a" aria-hidden="true" />
      <div className="bg-blob blob-b" aria-hidden="true" />

      <Header
        focusDate={focusDate}
        onPrevDay={() => shiftFocusDate(-1)}
        onNextDay={() => shiftFocusDate(1)}
        onPickDate={jumpToDate}
        onToday={goToday}
      />

      <div className="board">
        <aside className="side-panel">
          <section className="panel-card new-event-card">
            <h2 className="panel-label">Nuova attività</h2>
            <p className="new-event-hint">
              Apri una finestra dedicata per aggiungere titolo, priorità, data e
              luogo di una nuova attività.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => setModalOpen(true)}
            >
              <IconPlus />
              Nuovo evento
            </button>
          </section>

          <CalendarPanel selected={dateFilter} onSelect={setDateFilter} />
          <ProgressCard
            activeCount={activeCount}
            completedCount={completedCount}
            totalCount={totalCount}
            isFiltered={isFiltered}
            filteredCount={visibleTodos.length}
            onClearCompleted={askClearCompleted}
            onClearAll={askClearAll}
            onClearActive={askClearActive}
            onClearFiltered={askClearFiltered}
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
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
          />

          <StatsPanel todos={visibleTodos} />

          {error && (
            <div className="error-banner" role="alert">
              Qualcosa è andato storto: {error}
            </div>
          )}

          <TodoList
            todos={visibleTodos}
            loading={loading}
            isFiltered={isFiltered}
            onToggle={handleToggle}
            onDelete={askDelete}
            onUpdate={handleUpdate}
          />
        </main>
      </div>

      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
        defaultDate={modalDefaultDate}
      />

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
