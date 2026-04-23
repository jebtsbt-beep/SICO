const app = require('./app');
require('./config/database'); // Esto dispara la creación y el esquema automáticamente

const PORT = 4000;

app.listen(PORT, () => {
    console.log(`
    =========================================
    SICO SYSTEM IS LIVE
    Port: ${PORT}
    Database: database.sqlite
    =========================================
    `);
});