const QueryBuilder = require('../../models/queryBuilder');

class Supply {
    static async getAll(companyId) {
        return await QueryBuilder.all("SELECT * FROM supplies WHERE company_id = ?", [companyId]);
    }

    static async getByName(name, companyId) {
        return await QueryBuilder.get("SELECT * FROM supplies WHERE name = ? AND company_id = ?", [name, companyId]);
    }

    static async create(data) {
        const existing = await this.getByName(data.name, data.companyId);
        if (existing) return existing.id;

        const sql = `INSERT INTO supplies (company_id, name, base_unit_id) VALUES (?, ?, ?)`;
        const res = await QueryBuilder.run(sql, [data.companyId, data.name, data.baseUnitId]);
        return res.id;
    }

    static async update(id, data) {
        return await QueryBuilder.run(`UPDATE supplies SET name = ?, base_unit_id = ? WHERE id = ?`, 
            [data.name, data.baseUnitId, id]);
    }

    static async delete(id) {
        const inRecipe = await QueryBuilder.get("SELECT product_id FROM product_supplies WHERE supply_id = ?", [id]);
        if (inRecipe) throw new Error("Insumo bloqueado: Está en una receta de producto.");
        await QueryBuilder.run("DELETE FROM provider_supplies WHERE supply_id = ?", [id]);
        return await QueryBuilder.run("DELETE FROM supplies WHERE id = ?", [id]);
    }
}
module.exports = Supply;