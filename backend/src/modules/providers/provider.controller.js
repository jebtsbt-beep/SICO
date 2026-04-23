const Provider = require('./providers.service');

exports.getAll = async (req, res) => {
    const data = await Provider.getAll();
    res.json({ success: true, data });
};

exports.create = async (req, res) => {
    try {
        const id = await Provider.create(req.body);
        res.status(201).json({ success: true, id });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.update = async (req, res) => {
    await Provider.update(req.params.id, req.body);
    res.json({ success: true, message: "Proveedor actualizado" });
};

exports.delete = async (req, res) => {
    try {
        await Provider.delete(req.params.id);
        res.json({ success: true, message: "Proveedor eliminado" });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};