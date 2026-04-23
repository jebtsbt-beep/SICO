const Supply = require('./supplies.service');

exports.getAll = async (req, res) => {
    try {
        const { companyId } = req.query; // Lo filtramos por empresa
        const supplies = await Supply.getByCompany(companyId || 1);
        console.log(supplies)
        res.json({ success: true, data: supplies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { id } = req.params;
        await Supply.create(id, req.body);
        res.json({ success: true, message: "Suministro actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        await Supply.update(id, req.body);
        res.json({ success: true, message: "Suministro actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await Supply.delete(id);
        res.json({ success: true, message: "Suministro eliminado del sistema" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};