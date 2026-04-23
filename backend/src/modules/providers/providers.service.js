const QueryBuilder = require('../../models/queryBuilder');

class Provider {
    static async getAll() {
        return await QueryBuilder.all("SELECT * FROM providers ORDER BY name ASC");
    }

    static async getByNit(nit) {
        return await QueryBuilder.get("SELECT * FROM providers WHERE nit = ?", [nit]);
    }

    static async create(data) {
        const existing = await this.getByNit(data.nit);
        if (existing) return existing.id;

        const sql = `INSERT INTO providers (nit, name, phone, email) VALUES (?, ?, ?, ?)`;
        const res = await QueryBuilder.run(sql, [data.nit, data.name, data.phone, data.email]);
        return res.id;
    }

    static async update(id, data) {
        return await QueryBuilder.run(
            `UPDATE providers SET nit = ?, name = ?, phone = ?, email = ? WHERE id = ?`,
            [data.nit, data.name, data.phone, data.email, id]
        );
    }

    static async delete(id) {
        const linked = await QueryBuilder.get("SELECT id FROM provider_supplies WHERE provider_id = ?", [id]);
        if (linked) throw new Error("No se puede eliminar: Proveedor con insumos asociados.");
        return await QueryBuilder.run("DELETE FROM providers WHERE id = ?", [id]);
    }

    static async linkToSupply(data) {
    const existing = await QueryBuilder.get(
        "SELECT id FROM provider_supplies WHERE supply_id = ? AND provider_id = ?",
        [data.supplyId, data.providerId]
    );
    
    if (existing) return existing.id;

    const sql = `INSERT INTO provider_supplies 
        (supply_id, provider_id, provider_item_code, purchase_unit_id, conversion_factor, last_price) 
        VALUES (?, ?, ?, ?, ?, ?)`;
    
    const res = await QueryBuilder.run(sql, [
        data.supplyId, data.providerId, data.itemCode, data.unitId, data.factor, data.price
    ]);

    await QueryBuilder.run("UPDATE supplies SET is_active = 1 WHERE id = ?", [data.supplyId]);
    return res.id;
}
}
module.exports = Provider;