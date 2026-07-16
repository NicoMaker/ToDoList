import { PRIORITIES } from "../../constants";

/**
 * Selettore di priorità a segmenti (Alta / Media / Bassa).
 * Usato sia nel form di creazione che nella modalità modifica.
 *
 * Props:
 * - value: priorità selezionata ("alta" | "media" | "bassa")
 * - onChange: (nuovoValore) => void
 * - small: variante compatta (per l'edit inline)
 */
export default function PrioritySegment({ value, onChange, small = false }) {
  return (
    <div
      className={`priority-segment ${small ? "small" : ""}`}
      role="radiogroup"
      aria-label="Priorità"
    >
      {PRIORITIES.map((p) => (
        <button
          key={p.value}
          type="button"
          role="radio"
          aria-checked={value === p.value}
          className={`segment-btn prio-${p.value} ${
            value === p.value ? "active" : ""
          }`}
          onClick={() => onChange(p.value)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
