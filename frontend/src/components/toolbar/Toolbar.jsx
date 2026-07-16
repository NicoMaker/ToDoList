import { IconSearch, IconPin } from "../icons/Icons";
import { PRIORITIES } from "../../constants";

const FILTERS = [
  ["tutti", "Tutte"],
  ["attivi", "Da fare"],
  ["completati", "Completate"],
];

/**
 * Barra strumenti: campo di ricerca + filtri a pillola + filtro priorità
 * (selezione multipla: alta/media/bassa, anche più di una insieme) +
 * filtro per luogo.
 *
 * Props:
 * - search, onSearchChange
 * - filter ("tutti" | "attivi" | "completati"), onFilterChange
 * - locations: elenco dei luoghi distinti già usati
 * - locationFilter, onLocationFilterChange
 * - priorityFilter: array di priorità selezionate (vuoto = tutte)
 * - onPriorityFilterChange(nextArray)
 */
export default function Toolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  locations = [],
  locationFilter = "",
  onLocationFilterChange,
  priorityFilter = [],
  onPriorityFilterChange,
}) {
  const togglePriority = (value) => {
    if (priorityFilter.includes(value)) {
      onPriorityFilterChange(priorityFilter.filter((p) => p !== value));
    } else {
      onPriorityFilterChange([...priorityFilter, value]);
    }
  };

  return (
    <div className="toolbar">
      <div className="search-box">
        <IconSearch />
        <input
          type="text"
          placeholder="Cerca tra le attività…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Cerca attività"
        />
      </div>

      <div className="filters" role="tablist" aria-label="Filtra attività">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            role="tab"
            aria-selected={filter === value}
            className={`filter-btn ${filter === value ? "active" : ""}`}
            onClick={() => onFilterChange(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className="priority-filter-group"
        role="group"
        aria-label="Filtra per priorità"
      >
        {PRIORITIES.map((p) => {
          const active = priorityFilter.includes(p.value);
          return (
            <button
              key={p.value}
              type="button"
              aria-pressed={active}
              className={`priority-filter-btn prio-${p.value} ${active ? "active" : ""}`}
              onClick={() => togglePriority(p.value)}
              title={`Priorità ${p.label.toLowerCase()}`}
            >
              <span className="priority-filter-dot" aria-hidden="true" />
              {p.label}
            </button>
          );
        })}
      </div>

      {locations.length > 0 && (
        <label className="location-filter">
          <IconPin />
          <select
            value={locationFilter}
            onChange={(e) => onLocationFilterChange(e.target.value)}
            aria-label="Filtra per luogo"
          >
            <option value="">Tutti i luoghi</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
