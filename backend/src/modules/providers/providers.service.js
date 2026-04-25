const QueryBuilder = require('../../models/queryBuilder');
// Importación en la parte superior

class ProviderService {
    static async getAll(companyId) {
        return await QueryBuilder.all("SELECT * FROM providers ORDER BY name ASC");
    }

    static async getById(id) {
        return await QueryBuilder.get("SELECT * FROM providers WHERE id = ?", [id]);
    }

    static async create(data) {
        const existing = await QueryBuilder.get("SELECT id FROM providers WHERE nit = ?", [data.nit]);
        if (existing) return existing.id;
        const sql = `INSERT INTO providers (nit, name, phone, email) VALUES (?, ?, ?, ?)`;
        const res = await QueryBuilder.run(sql, [data.nit, data.name, data.phone, data.email]);
        return res.id;
    }

    static async update(id, data) {
        const sql = `UPDATE providers SET nit = ?, name = ?, phone = ?, email = ? WHERE id = ?`;
        return await QueryBuilder.run(sql, [data.nit, data.name, data.phone, data.email, id]);
    }

    static async delete(id) {
        // Obtenemos los insumos afectados antes de borrar para actualizar su estado después
        const affectedSupplies = await QueryBuilder.all("SELECT supply_id FROM provider_supplies WHERE provider_id = ?", [id]);
        
        await QueryBuilder.run("DELETE FROM provider_supplies WHERE provider_id = ?", [id]);
        const res = await QueryBuilder.run("DELETE FROM providers WHERE id = ?", [id]);

        // Verificación de estado para cada insumo que perdió a este proveedor
        for (const s of affectedSupplies) {
            await SupplyService.verifyStatus(s.supply_id);
        }
        return res;
    }

    static async link(data) {
        const SupplyService = require('../supplies/supplies.service');
        const existing = await QueryBuilder.get(
            "SELECT id FROM provider_supplies WHERE supply_id = ? AND provider_id = ?", 
            [data.supplyId, data.providerId]
        );

        if (existing) {
            const sql = `UPDATE provider_supplies SET last_price = ?, provider_item_code = ? WHERE id = ?`;
            await QueryBuilder.run(sql, [data.price, data.itemCode, existing.id]);
        } else {
            const sql = `INSERT INTO provider_supplies (supply_id, provider_id, provider_item_code, purchase_unit_id, conversion_factor, last_price) VALUES (?, ?, ?, ?, ?, ?)`;
            await QueryBuilder.run(sql, [data.supplyId, data.providerId, data.itemCode, data.unitId, data.factor, data.price]);
        }
        
        // Ejecutar verificación de estado del insumo
        return await SupplyService.verifyStatus(data.supplyId);
    }

    static async unlink(supplyId, providerId) {
        const SupplyService = require('../supplies/supplies.service');
        const sql = `DELETE FROM provider_supplies WHERE supply_id = ? AND provider_id = ?`;
        await QueryBuilder.run(sql, [supplyId, providerId]);
        
        // Ejecutar verificación de estado del insumo
        return await SupplyService.verifyStatus(supplyId);
    }
}

module.exports = ProviderService;