const Product = require('./products.service');
const QueryBuilder = require('../../models/queryBuilder');

exports.getAll = async (req, res) => {
    console.log("[PRODUCTS CTRL] GET ALL - Empresa:", req.params.companyId);
    try {
        const data = await Product.getAll(req.params.companyId);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await Product.getById(req.params.id);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.create = async (req, res) => {
    console.log("[PRODUCTS CTRL] Iniciando inducción de:", req.body.product?.name);
    try {
        await QueryBuilder.beginTransaction();
        const { companyId, product, ingredients } = req.body;
        const productId = await Product.create(companyId, product, ingredients);
        await QueryBuilder.commit();
        console.log("[PRODUCTS CTRL] Éxito. Producto ID:", productId);
        res.status(201).json({ success: true, productId });
    } catch (err) {
        await QueryBuilder.rollback();
        console.error("[PRODUCTS CTRL] FALLO EN INDUCCIÓN:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.update = async (req, res) => {
    console.log("[PRODUCTS CTRL] Actualizando producto ID:", req.params.id);
    try {
        await QueryBuilder.beginTransaction();
        // Extraemos solo los campos editables manualmente, EXCLUYENDO is_active
        await Product.update(req.params.id, req.body);
        
        // Forzamos que la función verifyStatus sea la que decida el estado final
        await Product.verifyStatus(req.params.id);        await QueryBuilder.commit();
        res.json({ success: true, message: "Producto actualizado" });
    } catch (err) {
        await QueryBuilder.rollback();
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.delete = async (req, res) => {
    console.log("[PRODUCTS CTRL] Eliminando producto ID:", req.params.id);
    try {
        await QueryBuilder.beginTransaction();
        await Product.delete(req.params.id);
        await QueryBuilder.commit();
        res.json({ success: true, message: "Producto y receta eliminados" });
    } catch (err) {
        await QueryBuilder.rollback();
        console.error("[PRODUCTS CTRL] Fallo al eliminar:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};