# 📝 Todo List — Express + SQLite3 + React

App full-stack completa per gestire una lista di attività, con tutte le operazioni CRUD (crea, leggi, modifica, elimina) e frontend moderno.

## Struttura del progetto

```
todo-app/
├── backend/          # API Express + SQLite3
│   ├── server.js      # Rotte CRUD
│   ├── database.js    # Connessione e schema SQLite
│   └── package.json
└── frontend/          # React (Vite)
    ├── src/
    │   ├── App.jsx     # Interfaccia completa
    │   ├── App.css     # Stile moderno
    │   └── api.js       # Client per le chiamate al backend
    └── package.json
```

## Come avviare il backend

```bash
cd backend
npm install
npm start
```

Il server parte su **http://localhost:3001**. Il database `todos.db` viene creato automaticamente al primo avvio (nessuna configurazione necessaria).

### API disponibili

| Metodo | Endpoint                     | Descrizione                                            |
| ------ | ---------------------------- | ------------------------------------------------------ |
| GET    | `/api/todos`                 | Lista todo (filtri: `completed`, `priority`, `search`) |
| GET    | `/api/todos/:id`             | Dettaglio singolo todo                                 |
| POST   | `/api/todos`                 | Crea nuovo todo                                        |
| PUT    | `/api/todos/:id`             | Modifica un todo esistente                             |
| PATCH  | `/api/todos/:id/toggle`      | Alterna completato/non completato                      |
| DELETE | `/api/todos/:id`             | Elimina un todo                                        |
| DELETE | `/api/todos/clear/completed` | Elimina tutti i todo completati                        |

## Come avviare il frontend

In un secondo terminale:

```bash
cd frontend
npm install
npm run dev
```

Il frontend parte su **http://localhost:5173** e inoltra automaticamente le chiamate `/api/*` al backend (grazie al proxy configurato in `vite.config.js`).

## Funzionalità incluse

- ✅ Creazione todo con titolo, descrizione e priorità (alta/media/bassa)
- ✅ Modifica in linea (edit mode) di ogni todo
- ✅ Eliminazione singola o di tutti i completati
- ✅ Toggle rapido completato/non completato con checkbox
- ✅ Filtri: tutti / attivi / completati
- ✅ Ricerca testuale in tempo reale (titolo e descrizione)
- ✅ Contatori attività da fare / completate
- ✅ Design moderno dark con badge colorati per priorità

## Note tecniche

- Il backend usa il pacchetto `sqlite3` (richiede build nativa alla `npm install`; serve una connessione internet normale e un ambiente standard Node.js — funziona automaticamente sulla maggior parte dei sistemi Windows/macOS/Linux).
- Se preferisci evitare compilazioni native, puoi sostituire `sqlite3` con `better-sqlite3` cambiando solo il file `database.js` (dimmi pure se vuoi che te lo prepari già così).
