function todayLabel() {
  const s = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Intestazione dell'app con la data di oggi. */
export default function Header() {
  return (
    <header className="masthead">
      <div>
        <p className="masthead-date">{todayLabel()}</p>
        <h1 className="masthead-title">Le mie attività</h1>
      </div>
    </header>
  );
}
