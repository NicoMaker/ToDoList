const { migrationPromise } = require("./config/database");

migrationPromise
  .then(() => {
    const app = require("./app");
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server in ascolto su http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Impossibile avviare il server:", err.message);
    process.exit(1);
  });
