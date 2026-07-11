import { IconSearch } from "./Icons";

const FILTERS = [
  ["tutti", "Tutte"],
  ["attivi", "Da fare"],
  ["completati", "Completate"],
];

/**
 * Barra strumenti: campo di ricerca + filtri a pillola.
 *
 * Props:
 * - search, onSearchChange
 * - filter ("tutti" | "attivi" | "completati"), onFilterChange
 */
export default function Toolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}) {
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
    </div>
  );
}
