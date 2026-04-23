const Company = require('./companies.service');

exports.getAll = async (req, res) => {
    try {
        const data = await Company.getAll();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const id = await Company.create(req.body);
        res.status(201).json({ success: true, companyId: id });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        await Company.update(req.params.id, req.body);
        res.json({ success: true, message: "Empresa actualizada correctamente" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await Company.delete(req.params.id);
        res.json({ success: true, message: "Empresa eliminada correctamente" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};