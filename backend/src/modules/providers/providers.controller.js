const Provider = require('./providers.service');
const QueryBuilder = require('../../models/queryBuilder');

// Obtener todos los proveedores
exports.getAll = async (req, res) => {
    console.log("[PROVIDERS CTRL] GET ALL BY Company_id: ", req.params.companyId);
    try {
        const data = await Provider.getAll(req.params.companyId);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Obtener proveedor por ID
exports.getById = async (req, res) => {
    console.log(`[PROVIDERS CTRL] GET BY ID: ${req.params.id}`);
    try {
        const data = await Provider.getById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: "No encontrado" });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Crear proveedor
exports.create = async (req, res) => {
    console.log("[PROVIDERS CTRL] CREATE:", req.body.name);
    try {
        await QueryBuilder.beginTransaction();
        const id = await Provider.create(req.body);
        await QueryBuilder.commit();
        res.status(201).json({ success: true, providerId: id });
    } catch (err) {
        await QueryBuilder.rollback();
        res.status(500).json({ success: false, error: err.message });
    }
};

// Actualizar proveedor
exports.update = async (req, res) => {
    console.log("[PROVIDERS CTRL] UPDATE ID:", req.params.id);
    try {
        await QueryBuilder.beginTransaction();
        await Provider.update(req.params.id, req.body);
        await QueryBuilder.commit();
        res.json({ success: true, message: "Proveedor actualizado" });
    } catch (err) {
        await QueryBuilder.rollback();
        res.status(500).json({ success: false, error: err.message });
    }
};

// Eliminar proveedor (Dispara verificación de estado en insumos afectados)
exports.delete = async (req, res) => {
    console.log("[PROVIDERS CTRL] DELETE ID:", req.params.id);
    try {
        await QueryBuilder.beginTransaction();
        await Provider.delete(req.params.id);
        await QueryBuilder.commit();
        res.json({ success: true, message: "Proveedor eliminado y estados actualizados" });
    } catch (err) {
        await QueryBuilder.rollback();
        res.status(500).json({ success: false, error: err.message });
    }
};

// VINCULAR PROVEEDOR A INSUMO (Link)
exports.link = async (req, res) => {
    console.log(`[PROVIDERS CTRL] LINK: Prov ${req.body.providerId} -> Insumo ${req.body.supplyId}`);
    try {
        await QueryBuilder.beginTransaction();
        // El service ejecuta verifyStatus(supplyId) internamente
        await Provider.link(req.body);
        await QueryBuilder.commit();
        res.json({ success: true, message: "Vínculo creado. Insumo verificado." });
    } catch (err) {
        await QueryBuilder.rollback();
        res.status(500).json({ success: false, error: err.message });
    }
};

// DESVINCULAR PROVEEDOR DE INSUMO (Unlink)
exports.unlink = async (req, res) => {
    console.log(`[PROVIDERS CTRL] UNLINK: Prov ${req.body.providerId} de Insumo ${req.body.supplyId}`);
    try {
        await QueryBuilder.beginTransaction();
        const { supplyId, providerId } = req.body;
        await Provider.unlink(supplyId, providerId);
        await QueryBuilder.commit();
        res.json({ success: true, message: "Vínculo eliminado. Insumo re-verificado." });
    } catch (err) {
        await QueryBuilder.rollback();
        res.status(500).json({ success: false, error: err.message });
    }
};