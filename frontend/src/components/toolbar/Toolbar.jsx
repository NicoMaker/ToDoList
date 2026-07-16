import { IconSearch, IconPin } from "../icons/Icons";

const FILTERS = [
  ["tutti", "Tutte"],
  ["attivi", "Da fare"],
  ["completati", "Completate"],
];

/**
 * Barra strumenti: campo di ricerca + filtri a pillola + filtro per luogo.
 *
 * Props:
 * - search, onSearchChange
 * - filter ("tutti" | "attivi" | "completati"), onFilterChange
 * - locations: elenco dei luoghi distinti già usati
 * - locationFilter, onLocationFilterChange
 */
export default function Toolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  locations = [],
  locationFilter = "",
  onLocationFilterChange,
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
