import { IconChevronLeft, IconChevronRight, IconCalendar } from "../icons/Icons";

function pad2(n) {
  return String(n).padStart(2, "0");
}

/** Data di oggi in formato YYYY-MM-DD */
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** "2026-07-16" -> "Giovedì 16 luglio" (aggiunge l'anno se diverso da quello corrente) */
function formatFocusDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  const opts = { weekday: "long", day: "numeric", month: "long" };
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = "numeric";
  const s = d.toLocaleDateString("it-IT", opts);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Intestazione dell'app: mostra la data attualmente "a fuoco" con
 * frecce per spostarsi di un giorno avanti/indietro, e un selettore
 * (icona calendario) per saltare direttamente a una data qualsiasi.
 *
 * Props:
 * - focusDate: data corrente in formato YYYY-MM-DD
 * - onPrevDay, onNextDay: spostano di un giorno
 * - onPickDate(iso): salta a una data scelta dal selettore
 * - onToday: torna al giorno odierno
 */
export default function Header({ focusDate, onPrevDay, onNextDay, onPickDate, onToday }) {
  const isToday = focusDate === todayISO();

  return (
    <header className="masthead">
      <div>
        <div className="masthead-nav">
          <button
            type="button"
            className="icon-btn"
            onClick={onPrevDay}
            aria-label="Giorno precedente"
          >
            <IconChevronLeft />
          </button>

          <label className="masthead-date-field">
            <IconCalendar width={13} height={13} />
            <span className="masthead-date">{formatFocusDate(focusDate)}</span>
            <input
              type="date"
              value={focusDate}
              onChange={(e) => e.target.value && onPickDate(e.target.value)}
              aria-label="Vai a una data specifica"
            />
          </label>

          <button
            type="button"
            className="icon-btn"
            onClick={onNextDay}
            aria-label="Giorno successivo"
          >
            <IconChevronRight />
          </button>

          {!isToday && (
            <button type="button" className="btn-link masthead-today" onClick={onToday}>
              Oggi
            </button>
          )}
        </div>
        <h1 className="masthead-title">Le mie attività</h1>
      </div>
    </header>
  );
}
