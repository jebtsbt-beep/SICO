const Product = require('./products.service');

// 1. Obtener todos
exports.getAll = async (req, res) => {
    try {
        const data = await Product.getAll(req.query.companyId || 1);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 2. Crear (Inducción)
exports.create = async (req, res) => {
    try {
        const { companyId, product, ingredients } = req.body;
        const result = await Product.create(companyId, product, ingredients);
        res.status(201).json({ success: true, productId: result.productId, isActive: result.isActive });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 3. Actualizar
exports.update = async (req, res) => {
    try {
        await Product.update(req.params.id, req.body.product, req.body.ingredients);
        res.json({ success: true, message: "Producto actualizado" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 4. Borrar (ESTA ES LA QUE ESTÁ FALLANDO)
exports.delete = async (req, res) => {
    try {
        await Product.delete(req.params.id);
        res.json({ success: true, message: "Producto eliminado" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};