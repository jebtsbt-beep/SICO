const QueryBuilder = require('../../models/queryBuilder');
const DIMENSIONS = require('../../config/dimensions');
const EntityProcessor = require('../../helpers/entityProcessor');

class SupplyService {
    static async getAll(companyId) {
        return await QueryBuilder.all("SELECT * FROM supplies WHERE company_id = ?", [companyId]);
    }

    static async getById(id) {
        return await QueryBuilder.get("SELECT * FROM supplies WHERE id = ?", [id]);
    }

    static async create(data) {
        const { companyId, name, baseUnitId, providers = [] } = data;

        // 1. Crear el insumo base
        const res = await QueryBuilder.run(
            "INSERT INTO supplies (company_id, name, base_unit_id, is_active) VALUES (?, ?, ?, 0)",
            [companyId, name, baseUnitId]
        );

        // 2. Procesar proveedores
        await EntityProcessor.process(providers, DIMENSIONS.PROVIDERS, res.id, { companyId });

        // 3. Verificación final
        await this.verifyStatus(res.id);
        return res.id;
    }

    static async update(supplyId, data) {
        const { companyId, name, baseUnitId, providers = [] } = data;

        // 1. Actualizar datos básicos
        await QueryBuilder.run(
            "UPDATE supplies SET name = ?, base_unit_id = ? WHERE id = ?",
            [name, baseUnitId, supplyId]
        );

        // 2. Sincronizar proveedores
        if (providers.length > 0) {
            await EntityProcessor.process(providers, DIMENSIONS.PROVIDERS, supplyId, { companyId });
        }

        // 3. Re-evaluar estado
        return await this.verifyStatus(supplyId);
    }

    static async verifyStatus(supplyId) {
        const res = await QueryBuilder.get("SELECT COUNT(*) as count FROM provider_supplies WHERE supply_id = ?", [supplyId]);
        const isActive = res.count > 0 ? 1 : 0;
        
        await QueryBuilder.run("UPDATE supplies SET is_active = ? WHERE id = ?", [isActive, supplyId]);
        console.log(`[SUPPLY SERVICE] Estado Insumo ${supplyId}: ${isActive === 1 ? 'ACTIVO' : 'INACTIVO'}`);

        // Notificar a los productos que usan este insumo
        const products = await QueryBuilder.all("SELECT product_id FROM product_supplies WHERE supply_id = ?", [supplyId]);
        
        // Importación local para evitar círculo vicioso
        const ProductService = require('../products/products.service'); 
        for (const p of products) {
            await ProductService.verifyStatus(p.product_id);
        }
        
        return isActive;
    }

    static async delete(id) {
        // Recuperar productos afectados antes de borrar
        const affected = await QueryBuilder.all("SELECT product_id FROM product_supplies WHERE supply_id = ?", [id]);
        
        await QueryBuilder.run("DELETE FROM supplies WHERE id = ?", [id]);

        // Re-verificar los productos que lo usaban
        const ProductService = require('./products.service');
        for (const p of affected) {
            await ProductService.verifyStatus(p.product_id);
        }
    }
}

module.exports = SupplyService;