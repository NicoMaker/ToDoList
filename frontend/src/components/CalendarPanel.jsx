import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { IconCalendar, IconChevronLeft, IconChevronRight } from "./Icons";

const MESI = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];
const GIORNI_SETTIMANA = ["L", "M", "M", "G", "V", "S", "D"];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISODate(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Numero di giorni nel mese (month è 1-12) */
function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/** Indice (0=Lunedì...6=Domenica) del primo giorno del mese */
function firstWeekdayOffset(year, month) {
  const jsDay = new Date(year, month - 1, 1).getDay(); // 0=Domenica
  return (jsDay + 6) % 7;
}

/**
 * Pannello calendario: naviga tra i mesi, mostra un puntino sui giorni
 * con attività (tramite conteggio dal backend) e permette di selezionare
 * un giorno preciso oppure "tutto il mese" come criterio di filtro.
 * Chiama onSelect({ year, month, day }) — day è null se si vuole l'intero mese.
 *
 * Props:
 * - selected: { year, month, day } | null (null = nessun filtro data attivo)
 * - onSelect(selection): selection è { year, month, day|null } oppure null per rimuovere il filtro
 */
export default function CalendarPanel({ selected, onSelect }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(
    selected?.year ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    selected?.month ?? today.getMonth() + 1,
  );
  const [counts, setCounts] = useState({});

  const loadCounts = useCallback(async () => {
    try {
      const data = await api.getCalendarCounts(viewYear, viewMonth);
      setCounts(data);
    } catch {
      setCounts({});
    }
  }, [viewYear, viewMonth]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const changeMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m > 12) {
      m = 1;
      y += 1;
    } else if (m < 1) {
      m = 12;
      y -= 1;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  const isSelectedMonth =
    selected && selected.year === viewYear && selected.month === viewMonth;
  const selectedDay = isSelectedMonth ? selected.day : null;

  const handleDayClick = (day) => {
    const iso = toISODate(viewYear, viewMonth, day);
    const alreadySelected = selectedDay === day;
    if (alreadySelected) {
      onSelect(null); // ri-clicco lo stesso giorno → tolgo il filtro
    } else {
      onSelect({ year: viewYear, month: viewMonth, day, iso });
    }
  };

  const handleWholeMonth = () => {
    if (isSelectedMonth && selectedDay === null) {
      onSelect(null);
    } else {
      onSelect({ year: viewYear, month: viewMonth, day: null });
    }
  };

  const totalDays = daysInMonth(viewYear, viewMonth);
  const offset = firstWeekdayOffset(viewYear, viewMonth);
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const isToday = (day) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() + 1 &&
    viewYear === today.getFullYear();

  return (
    <section className="panel-card calendar-panel">
      <div className="calendar-header">
        <h2 className="panel-label calendar-title">
          <IconCalendar /> Calendario
        </h2>
        <div className="calendar-nav">
          <button
            type="button"
            className="icon-btn"
            onClick={() => changeMonth(-1)}
            aria-label="Mese precedente"
          >
            <IconChevronLeft />
          </button>
          <button
            type="button"
            className={`calendar-month-label ${
              isSelectedMonth && selectedDay === null ? "active" : ""
            }`}
            onClick={handleWholeMonth}
            title="Filtra per tutto il mese"
          >
            {MESI[viewMonth - 1]} {viewYear}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => changeMonth(1)}
            aria-label="Mese successivo"
          >
            <IconChevronRight />
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {GIORNI_SETTIMANA.map((g, i) => (
          <span key={i}>{g}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((day, i) => {
          if (day === null) return <span key={`empty-${i}`} />;
          const count = counts[toISODate(viewYear, viewMonth, day)] || 0;
          const active = selectedDay === day;
          return (
            <button
              type="button"
              key={day}
              className={`calendar-day ${active ? "active" : ""} ${
                isToday(day) ? "today" : ""
              }`}
              onClick={() => handleDayClick(day)}
              aria-pressed={active}
              aria-label={`${day} ${MESI[viewMonth - 1]}${
                count ? `, ${count} attività` : ""
              }`}
            >
              {day}
              {count > 0 && <span className="calendar-dot" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {selected && (
        <button type="button" className="btn-link" onClick={() => onSelect(null)}>
          Rimuovi filtro data
        </button>
      )}
    </section>
  );
}
