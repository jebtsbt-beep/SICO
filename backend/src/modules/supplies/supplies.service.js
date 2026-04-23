const QueryBuilder = require('../../models/queryBuilder');

class Supply {
    static async create({ companyId, name, baseUnitId }) {
        const sql = `INSERT INTO supplies (company_id, name, base_unit_id) VALUES (?, ?, ?)`;
        const result = await QueryBuilder.run(sql, [companyId, name, baseUnitId]);
        return result.id;
    }

    // Relaciona el insumo con su proveedor y empaque (Inducción)
    static async linkToProvider({ supplyId, providerId, itemCode, unitId, factor, price }) {
        const sql = `
            INSERT INTO provider_supplies 
            (supply_id, provider_id, provider_item_code, purchase_unit_id, conversion_factor, last_price) 
            VALUES (?, ?, ?, ?, ?, ?)`;
        return await QueryBuilder.run(sql, [supplyId, providerId, itemCode, unitId, factor, price]);
    }

    // SELECT: Ver todos los insumos de una empresa con su stock total
    static async getByCompany(companyId) {
        const sql = `
            SELECT s.*, SUM(ps.current_stock) as total_stock, mu.abbreviation
            FROM supplies s
            LEFT JOIN provider_supplies ps ON s.id = ps.supply_id
            JOIN measurement_units mu ON s.base_unit_id = mu.id
            WHERE s.company_id = ?
            GROUP BY s.id`;
        return await QueryBuilder.all(sql, [companyId]);
    }

    // UPDATE: Cambio de nombre o alertas de stock
    static async update(id, { name }) {
        return await QueryBuilder.run("UPDATE supplies SET name = ? WHERE id = ?", [name, id]);
    }

    // DELETE: Borrado en cascada (Si borras el insumo, se borran sus precios de proveedores)
    static async delete(id) {
        // SQLite con ON DELETE CASCADE en la tabla provider_supplies se encarga del resto
        return await QueryBuilder.run("DELETE FROM supplies WHERE id = ?", [id]);
    }
}

module.exports = Supply;