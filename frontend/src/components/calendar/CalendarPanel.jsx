import { useEffect, useState, useCallback } from "react";
import { api } from "../../api";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from "../icons/Icons";

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

/** "2026-07-16" -> "16 lug" */
function formatChip(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

/**
 * Pannello calendario: naviga tra i mesi, vedi un puntino sui giorni con
 * attività e scegli come filtrare la lista:
 * - clicca uno o più giorni per selezionarli insieme (anche in mesi diversi,
 *   navigando avanti e indietro) e vedere tutte le attività di quei giorni;
 * - clicca il nome del mese per filtrare invece l'intero mese.
 *
 * Props:
 * - selected: null | { type: "days", dates: string[] } | { type: "month", year, month }
 * - onSelect(selection): come sopra, oppure null per rimuovere il filtro
 */
export default function CalendarPanel({ selected, onSelect }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
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

  const isDaysMode = selected?.type === "days";
  const selectedDates = isDaysMode ? selected.dates : [];
  const isWholeMonthActive =
    selected?.type === "month" &&
    selected.year === viewYear &&
    selected.month === viewMonth;

  const toggleDay = (day) => {
    const iso = toISODate(viewYear, viewMonth, day);
    let next;
    if (selectedDates.includes(iso)) {
      next = selectedDates.filter((d) => d !== iso);
    } else {
      next = [...selectedDates, iso].sort();
    }
    onSelect(next.length > 0 ? { type: "days", dates: next } : null);
  };

  const removeDate = (iso) => {
    const next = selectedDates.filter((d) => d !== iso);
    onSelect(next.length > 0 ? { type: "days", dates: next } : null);
  };

  const handleWholeMonth = () => {
    onSelect(
      isWholeMonthActive ? null : { type: "month", year: viewYear, month: viewMonth },
    );
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
            className={`calendar-month-label ${isWholeMonthActive ? "active" : ""}`}
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
          const iso = toISODate(viewYear, viewMonth, day);
          const count = counts[iso] || 0;
          const active = selectedDates.includes(iso);
          return (
            <button
              type="button"
              key={day}
              className={`calendar-day ${active ? "active" : ""} ${
                isToday(day) ? "today" : ""
              }`}
              onClick={() => toggleDay(day)}
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

      <p className="calendar-hint">
        Seleziona uno o più giorni, anche cambiando mese, per vederli insieme.
      </p>

      {selectedDates.length > 0 && (
        <div className="calendar-chip-row">
          {selectedDates.map((iso) => (
            <span className="calendar-chip" key={iso}>
              {formatChip(iso)}
              <button
                type="button"
                onClick={() => removeDate(iso)}
                aria-label={`Rimuovi ${formatChip(iso)} dal filtro`}
              >
                <IconX />
              </button>
            </span>
          ))}
        </div>
      )}

      {selected && (
        <button type="button" className="btn-link" onClick={() => onSelect(null)}>
          Rimuovi filtro data
        </button>
      )}
    </section>
  );
}
