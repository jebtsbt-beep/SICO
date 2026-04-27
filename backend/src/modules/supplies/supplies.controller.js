const Supply = require('./supplies.service');
const QueryBuilder = require('../../models/queryBuilder');

// Obtener todos los insumos de una empresa
exports.getAll = async (req, res) => {
    console.log("[SUPPLIES CTRL] GET ALL- companyId: ", req.params.companyId);
    try {
        const data = await Supply.getAll(req.params.companyId);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Obtener insumo por ID
exports.getById = async (req, res) => {
    try {
        const data = await Supply.getById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: "No encontrado" });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Crear insumo (Inicia inactivo por defecto)
exports.create = async (req, res) => {
    console.log(req.body);
    console.log("[SUPPLIES CTRL] CREATE:", req.body.name);
    try {
        await QueryBuilder.beginTransaction();
        const id = await Supply.create(req.body);
        await QueryBuilder.commit();
        res.status(201).json({ success: true, supplyId: id });
    } catch (err) {
        await QueryBuilder.rollback();
        res.status(500).json({ success: false, error: err.message });
    }
};

// Actualizar insumo (Dispara verificación de estado)
exports.update = async (req, res) => {
    console.log("[SUPPLIES CTRL] UPDATE ID:", req.params.id);
    try {
        await QueryBuilder.beginTransaction();
        await Supply.update(req.params.id, req.body);
        await QueryBuilder.commit();
        res.json({ success: true, message: "Insumo actualizado" });
    } catch (err) {
        await QueryBuilder.rollback();
        res.status(500).json({ success: false, error: err.message });
    }
};

// Eliminar insumo
exports.delete = async (req, res) => {
    console.log("[PRODUCTS CTRL] Eliminando producto ID:", req.params.id);

    try {
        const { id } = req.params;
        const { isDeleteComplete, targets } = req.body;
        await QueryBuilder.run("BEGIN TRANSACTION");

        await SupplyService.delete(id, isDeleteComplete, targets);

        await QueryBuilder.run("COMMIT");
        res.json({ success: true, message: "Operación de insumo procesada" });
    } catch (error) {
        await QueryBuilder.run("ROLLBACK");
        const msg = error.message.includes("FOREIGN KEY")
            ? "Imposible eliminar: El insumo sigue vinculado a recetas activas."
            : error.message;
        res.status(400).json({ success: false, error: msg });
    }
}

// VINCULAR INSUMO A PRODUCTO (Link a Receta)
exports.link = async (req, res) => {
    console.log(`[SUPPLIES CTRL] LINK: Insumo ${req.body.supplyId} -> Producto ${req.body.productId}`);
    try {
        await QueryBuilder.beginTransaction();
        // El service ejecuta verifyStatus(productId) internamente
        await Supply.link(req.body);
        await QueryBuilder.commit();
        res.json({ success: true, message: "Receta actualizada. Producto verificado." });
    } catch (err) {
        await QueryBuilder.rollback();
        res.status(500).json({ success: false, error: err.message });
    }
};

// DESVINCULAR INSUMO DE PRODUCTO (Unlink de Receta)
exports.unlink = async (req, res) => {
    console.log(`[SUPPLIES CTRL] UNLINK: Insumo ${req.body.supplyId} de Producto ${req.body.productId}`);
    try {
        await QueryBuilder.beginTransaction();
        const { productId, supplyId } = req.body;
        await Supply.unlink(productId, supplyId);
        await QueryBuilder.commit();
        res.json({ success: true, message: "Insumo fuera de receta. Producto re-verificado." });
    } catch (err) {
        await QueryBuilder.rollback();
        res.status(500).json({ success: false, error: err.message });
    }
};
