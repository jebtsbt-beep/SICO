const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const sqlPath = path.resolve(__dirname, './schema.sql');

// LÓGICA DE INICIO LIMPIO (Para testeo)
if (fs.existsSync(dbPath)) {
    try {
        fs.unlinkSync(dbPath);
        console.log('--- SICO TEST: Previous database cleared ---');
    } catch (err) {
        if (err.code === 'EBUSY') {
            console.warn('--- SICO WARN: Database is busy. Using existing file instead of clearing. ---');
        } else {
            throw err;
        }
    }
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('SICO DB Error:', err.message);
    } else {
        console.log('--- SICO ENGINE: New Database Created ---');
        initializeDatabase();
    }
});

async function initializeDatabase() {
    try {
        // 1. Aplicar Esquema
        const schema = fs.readFileSync(sqlPath, 'utf8');
        db.exec(schema, async (err) => {
            if (err) return console.error("Schema Error:", err);
            console.log('--- SICO ENGINE: Schema Applied ---');
            
            // 2. Inyectar Unidades de Medida Reales
            await injectMeasurementUnits();
        });
    } catch (error) {
        console.error("Initialization Error:", error);
    }
}

async function injectMeasurementUnits() {
    const units = [
        ['Kilogramo', 'kg'], ['Gramo', 'g'], ['Libra', 'lb'],
        ['Litro', 'lt'], ['Mililitro', 'ml'], ['Onza', 'oz'],
        ['Unidad', 'un'], ['Caja', 'box'], ['Paca', 'pkg'], ['Arroba', '@']
    ];

    const placeholders = units.map(() => '(?, ?)').join(', ');
    const sql = `INSERT INTO measurement_units (name, abbreviation) VALUES ${placeholders}`;
    const flatUnits = units.reduce((acc, val) => acc.concat(val), []);

    db.run(sql, flatUnits, (err) => {
        if (err) console.error("Seed Error:", err.message);
        else console.log('--- SICO ENGINE: Measurement Units Seeded ---');
    });
}

module.exports = db;