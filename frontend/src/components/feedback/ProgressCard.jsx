/** Anello SVG che mostra la percentuale di attività completate. */
function ProgressRing({ done, total }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const R = 34;
  const C = 2 * Math.PI * R;
  return (
    <div className="progress-ring" role="img" aria-label={`${pct}% completato`}>
      <svg viewBox="0 0 84 84">
        <circle className="ring-track" cx="42" cy="42" r={R} />
        <circle
          className="ring-value"
          cx="42"
          cy="42"
          r={R}
          strokeDasharray={C}
          strokeDashoffset={C - (C * pct) / 100}
        />
      </svg>
      <div className="ring-center">
        <span className="ring-pct">{pct}%</span>
      </div>
    </div>
  );
}

/**
 * Card "I tuoi progressi": anello + contatori, con azione per
 * eliminare tutte le attività completate.
 */
export default function ProgressCard({
  activeCount,
  completedCount,
  onClearCompleted,
}) {
  return (
    <section className="panel-card progress-card">
      <h2 className="panel-label">I tuoi progressi</h2>
      <div className="progress-row">
        <ProgressRing
          done={completedCount}
          total={activeCount + completedCount}
        />
        <div className="stats-col">
          <div className="stat">
            <span className="stat-num">{activeCount}</span>
            <span className="stat-label">da fare</span>
          </div>
          <div className="stat">
            <span className="stat-num">{completedCount}</span>
            <span className="stat-label">completate</span>
          </div>
        </div>
      </div>
      {completedCount > 0 && (
        <button className="btn-link" onClick={onClearCompleted}>
          Elimina le attività completate
        </button>
      )}
    </section>
  );
}
