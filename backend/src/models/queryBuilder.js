const db = require('../config/database.js');

const Query = {
    // Para consultas que devuelven MUCHAS filas (SELECT * FROM...)
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    // Para consultas que devuelven UNA sola fila (SELECT WHERE id = ?)
    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    // Para insertar, actualizar o borrar (INSERT, UPDATE, DELETE)
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                // Retorna el ID generado y cuántas filas afectó
                resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }
};

module.exports = Query;