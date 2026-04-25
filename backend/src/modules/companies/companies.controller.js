const Company = require('./companies.service');
const QueryBuilder = require('../../models/queryBuilder');

exports.getAll = async (req, res) => {
    console.log("[COMPANIES CTRL] Listando empresas...");
    try {
        const data = await Company.getAll();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getById = async (req, res) => {
    console.log(`[COMPANIES CTRL] Buscando ID: ${req.params.id}`);
    try {
        const data = await Company.getById(req.params.id);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.create = async (req, res) => {
    // Si ves este log, el JSON llegó bien
    console.log("[DEBUG] Body recibido:", req.body);
    
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "El cuerpo está vacío o mal formado" });
    }

    try {
        // ... tu lógica de transacción
        res.status(201).json({ success: true, id: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    console.log("[COMPANIES CTRL] Actualizando ID:", req.params.id);
    try {
        await QueryBuilder.beginTransaction();
        await Company.update(req.params.id, req.body);
        await QueryBuilder.commit();
        res.json({ success: true, message: "Empresa actualizada" });
    } catch (err) {
        await QueryBuilder.rollback();
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.delete = async (req, res) => {
    console.log("[COMPANIES CTRL] Eliminando ID:", req.params.id);
    try {
        await QueryBuilder.beginTransaction();
        await Company.delete(req.params.id);
        await QueryBuilder.commit();
        res.json({ success: true, message: "Empresa eliminada" });
    } catch (err) {
        await QueryBuilder.rollback();
        res.status(500).json({ success: false, error: err.message });
    }
};