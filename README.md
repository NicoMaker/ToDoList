# 📝 Todo List — Express + SQLite3 + React

App full-stack completa per gestire una lista di attività, con tutte le operazioni CRUD (crea, leggi, modifica, elimina), calendario per data di scadenza, filtro per luogo e frontend moderno a componenti.

## Come avviare il backend

```bash
cd backend
npm install
npm start
```

Il server parte su **http://localhost:3001**. Il database `todos.db` viene creato automaticamente al primo avvio (nessuna configurazione necessaria). Se aggiorni da una versione precedente dell'app, le colonne nuove (`due_date`, `location`) vengono aggiunte da sole al database esistente, senza perdere i dati.

### API disponibili

| Metodo | Endpoint                     | Descrizione                                                                                          |
| ------ | ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| GET    | `/api/todos`                 | Lista todo (filtri: `completed`, `priority`, `search`, `location`, `date`, `dates`, `year`, `month`) |
| GET    | `/api/todos/:id`             | Dettaglio singolo todo                                                                               |
| POST   | `/api/todos`                 | Crea nuovo todo (`title`, `description`, `priority`, `due_date`, `location`)                         |
| PUT    | `/api/todos/:id`             | Modifica un todo esistente                                                                           |
| PATCH  | `/api/todos/:id/toggle`      | Alterna completato/non completato                                                                    |
| DELETE | `/api/todos/:id`             | Elimina un todo                                                                                      |
| DELETE | `/api/todos/clear/completed` | Elimina tutti i todo completati                                                                      |
| GET    | `/api/todos/meta/locations`  | Elenco dei luoghi distinti già usati (per il filtro a tendina)                                       |
| GET    | `/api/todos/meta/calendar`   | Conteggio attività per giorno in un mese (`?year=&month=`)                                           |

`date` filtra per un giorno esatto (`YYYY-MM-DD`); `dates` filtra per più giorni insieme (elenco separato da virgole, es. `dates=2026-07-15,2026-07-20`) e ha la precedenza su `date`; `year`/`month` (senza `date`/`dates`) filtrano per l'intero mese — usati dal calendario.

## Come avviare il frontend

In un secondo terminale:

```bash
cd frontend
npm install
npm run dev
```

Il frontend parte su **http://localhost:5173** e inoltra automaticamente le chiamate `/api/*` al backend (grazie al proxy configurato in `vite.config.js`).

## Funzionalità incluse

- ✅ Creazione todo con titolo, descrizione, priorità (alta/media/bassa), **data di scadenza** e **luogo**
- ✅ Modifica in linea (edit mode) di ogni todo, inclusi data e luogo
- ✅ Eliminazione singola o di tutti i completati, **sempre con modale di conferma** ("Sei sicuro?")
- ✅ Toggle rapido completato/non completato con checkbox
- ✅ **Calendario** nella barra laterale: naviga tra i mesi, vedi un puntino sui giorni con attività
- ✅ **Selezione di più giorni insieme**: clicca più date (anche in mesi diversi, navigando avanti e indietro) per vedere tutte le attività di quei giorni in un colpo solo, oppure clicca il nome del mese per filtrare l'intero mese. Ogni giorno scelto appare come "francobollo" removibile sotto al calendario
- ✅ Creare una nuova attività direttamente per il giorno selezionato nel calendario, quando ne è selezionato uno solo (la data si precompila da sola)
- ✅ **Filtro per luogo**: una tendina mostra tutti i luoghi già usati e filtra le attività create in quel luogo
- ✅ Filtri: tutti / attivi / completati
- ✅ Ricerca testuale in tempo reale (titolo e descrizione)
- ✅ Contatori attività da fare / completate
- ✅ Design moderno con badge colorati per priorità, scadenza e luogo

## Struttura del progetto

```
backend/
  app.js                 # configurazione Express (middleware + rotte)
  server.js              # avvio del server HTTP
  config/database.js     # connessione SQLite + schema + migrazioni automatiche
  models/todoModel.js    # tutte le query SQL
  controllers/           # logica delle richieste HTTP
  routes/                # mappa URL -> controller
  middlewares/           # logger + gestione errori centralizzata

frontend/
  src/
    App.jsx               # stato globale + orchestrazione
    App.css               # tutto lo stile dell'app
    api.js                 # chiamate fetch verso il backend
    constants.js           # priorità disponibili
    components/
      layout/
        Header.jsx          # intestazione con data odierna
      tasks/
        AddTodoForm.jsx      # form nuova attività (titolo, nota, data, luogo, priorità)
        TodoList.jsx         # lista attività (stato vuoto/caricamento)
        TodoItem.jsx         # singola attività + modifica inline
        PrioritySegment.jsx  # selettore priorità a segmenti
      calendar/
        CalendarPanel.jsx    # calendario: selezione di uno o più giorni, o di un intero mese
      toolbar/
        Toolbar.jsx          # ricerca + filtri stato + filtro luogo
      feedback/
        ConfirmDialog.jsx    # modale di conferma per le eliminazioni
        ProgressCard.jsx     # anello di progresso + pulizia completati
      icons/
        Icons.jsx            # icone SVG condivise
```

## Note tecniche

- Il backend usa il pacchetto `sqlite3` (richiede build nativa alla `npm install`; serve una connessione internet normale e un ambiente standard Node.js — funziona automaticamente sulla maggior parte dei sistemi Windows/macOS/Linux).
- Se preferisci evitare compilazioni native, puoi sostituire `sqlite3` con `better-sqlite3` cambiando solo il file `config/database.js` (dimmi pure se vuoi che te lo prepari già così).
