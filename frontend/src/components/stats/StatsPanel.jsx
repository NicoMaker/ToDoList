import { PRIORITIES } from "../../constants";
import { IconChart } from "../icons/Icons";

const GIORNI_BREVI = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

function pad2(n) {
  return String(n).padStart(2, "0");
}

/** I prossimi n giorni (incluso oggi), con data ISO e etichetta breve */
function nextDays(n) {
  const days = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const iso = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    days.push({ iso, label: GIORNI_BREVI[d.getDay()] });
  }
  return days;
}

/**
 * Pannello statistiche con due mini grafici, calcolati sulle attività
 * attualmente visibili (rispettano quindi ricerca, filtri e priorità
 * selezionate):
 * - barre orizzontali: quante attività per ciascuna priorità;
 * - barre verticali: quante attività scadono nei prossimi 7 giorni.
 */
export default function StatsPanel({ todos }) {
  if (todos.length === 0) return null;

  const priorityCounts = PRIORITIES.map((p) => ({
    ...p,
    count: todos.filter((t) => (t.priority || "media") === p.value).length,
  }));
  const maxPriorityCount = Math.max(1, ...priorityCounts.map((p) => p.count));

  const week = nextDays(7).map((day) => ({
    ...day,
    count: todos.filter((t) => t.due_date === day.iso).length,
  }));
  const maxWeekCount = Math.max(1, ...week.map((d) => d.count));

  return (
    <section className="panel-card stats-panel">
      <h2 className="panel-label">
        <IconChart /> Statistiche
      </h2>
      <div className="stats-grid">
        <div className="stats-block">
          <h3 className="stats-block-title">Per priorità</h3>
          <div className="bar-chart-h">
            {priorityCounts.map((p) => (
              <div className="bar-row" key={p.value}>
                <span className="bar-label">{p.label}</span>
                <div className="bar-track">
                  <div
                    className={`bar-fill prio-${p.value}`}
                    style={{ width: `${(p.count / maxPriorityCount) * 100}%` }}
                  />
                </div>
                <span className="bar-count">{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-block">
          <h3 className="stats-block-title">Prossimi 7 giorni</h3>
          <div className="bar-chart-v">
            {week.map((d) => (
              <div className="vbar-col" key={d.iso}>
                <span className="vbar-count">{d.count > 0 ? d.count : ""}</span>
                <div className="vbar-track">
                  <div
                    className="vbar-fill"
                    style={{ height: `${(d.count / maxWeekCount) * 100}%` }}
                  />
                </div>
                <span className="vbar-day">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
