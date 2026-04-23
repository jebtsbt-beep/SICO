const QueryBuilder = require('../../models/queryBuilder');

class Provider {
    static async getAll() {
        return await QueryBuilder.all("SELECT * FROM providers ORDER BY name ASC");
    }

    static async getById(id) {
        return await QueryBuilder.get("SELECT * FROM providers WHERE id = ?", [id]);
    }

    static async create({ nit, name, phone, email }) {
        const sql = `INSERT INTO providers (nit, name, phone, email) VALUES (?, ?, ?, ?)`;
        const result = await QueryBuilder.run(sql, [nit, name, phone, email]);
        return result.id;
    }

    static async update(id, { nit, name, phone, email }) {
        const sql = `UPDATE providers SET nit = ?, name = ?, phone = ?, email = ? WHERE id = ?`;
        return await QueryBuilder.run(sql, [nit, name, phone, email, id]);
    }

    static async delete(id) {
        const linked = await QueryBuilder.get("SELECT id FROM provider_supplies WHERE provider_id = ?", [id]);
        if (linked) throw new Error("Restricción de Integridad: Proveedor con insumos vinculados.");
        return await QueryBuilder.run("DELETE FROM providers WHERE id = ?", [id]);
    }
}
module.exports = Provider;