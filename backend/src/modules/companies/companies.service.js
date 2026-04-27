const QueryBuilder = require('../../models/queryBuilder');

class CompanyService {
    static async getAll() {
        return await QueryBuilder.all("SELECT * FROM companies ORDER BY id DESC");
    }

    static async getById(id) {
        return await QueryBuilder.get("SELECT * FROM companies WHERE id = ?", [id]);
    }

    static async create(data) {
        const sql = `INSERT INTO companies (name, description) VALUES (?, ?)`;
        // Usamos "" si data.description no existe
        const res = await QueryBuilder.run(sql, [data.name, data.description || ""]);
        return res.id;
    }

    static async update(id, data) {
        const sql = `UPDATE companies SET name = ?, description = ? WHERE id = ?`;
        const res = await QueryBuilder.run(sql, [data.name, data.description, id]);
        if (res.changes === 0) throw new Error("ERR_NOT_FOUND: Empresa no encontrada.");
        return res;
    }

    static async delete(id) {
        const hasProducts = await QueryBuilder.get("SELECT id FROM products WHERE company_id = ? LIMIT 1", [id]);
        const hasSupplies = await QueryBuilder.get("SELECT id FROM supplies WHERE company_id = ? LIMIT 1", [id]);
        if (hasProducts || hasSupplies) {
            throw new Error("INTEGRITY_ERR: La empresa tiene productos o insumos vinculados.");
        }
        const res = await QueryBuilder.run("DELETE FROM companies WHERE id = ?", [id]);
        if (res.changes === 0) throw new Error("ERR_NOT_FOUND: Empresa no encontrada.");
        return res;
    }
}

module.exports = CompanyService;
