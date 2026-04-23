const Product = require('./products.service');

exports.getAll = async (req, res) => {
    const data = await Product.getAll(req.query.companyId || 1);
    res.json({ success: true, data });
};

exports.induct = async (req, res) => {
    try {
        const id = await Product.inductFullProduct(req.body.companyId, req.body.product, req.body.ingredients);
        res.status(201).json({ success: true, productId: id });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.delete = async (req, res) => {
    await Product.delete(req.params.id);
    res.json({ success: true, message: "Producto y receta eliminados" });
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, salePrice, isActive, barcode, ingredients } = req.body;

        // 1. Actualizar datos maestros del producto
        await Product.update(id, { name, salePrice, isActive, barcode });

        // 2. Si se envían ingredientes, actualizar la receta
        if (ingredients && ingredients.length > 0) {
            await Product.updateRecipe(id, ingredients);
        }

        res.json({ success: true, message: "Producto y receta actualizados correctamente" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};