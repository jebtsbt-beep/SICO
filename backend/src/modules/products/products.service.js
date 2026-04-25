const QueryBuilder = require('../../models/queryBuilder');
const DIMENSIONS = require('../../config/dimensions');
const EntityProcessor = require('../../helpers/entityProcessor');

class ProductService {
    static async getAll(companyId) {
        return await QueryBuilder.all("SELECT * FROM products WHERE company_id = ?", [companyId]);
    }

    static async getById(id) {
        return await QueryBuilder.get("SELECT * FROM products WHERE id = ?", [id]);
    }

    static async create(companyId, productData, ingredients = []) {
        const company = await QueryBuilder.get("SELECT id FROM companies WHERE id = ?", [companyId]);
        if (!company) throw new Error(`Operación Ilegal: La empresa con ID ${companyId} no existe.`);
        // 1. Crear el producto base
        const pRes = await QueryBuilder.run(
            "INSERT INTO products (company_id, barcode, name, sale_price, is_active) VALUES (?, ?, ?, ?, 0)", 
            [companyId, productData.barcode, productData.name, productData.salePrice]
        );
        
        // 2. Procesar cascada de ingredientes y proveedores
        await EntityProcessor.process(ingredients, DIMENSIONS.SUPPLIES, pRes.id, { companyId });

        // 3. Verificación final de estado
        await this.verifyStatus(pRes.id);
        return pRes.id;
    }

    static async update(productId, data) {
        // 1. Actualizar datos básicos
        const companyId = data.companyId;
        
        const sql = `UPDATE products SET barcode = ?, name = ?, sale_price = ? WHERE id = ?`;
        await QueryBuilder.run(sql, [data.barcode, data.name, data.salePrice, productId]);

        // 2. Sincronizar ingredientes (el motor decide si es nuevo o actualización)
        if (data.ingredients) {
            await EntityProcessor.process(data.ingredients, DIMENSIONS.SUPPLIES, productId, { companyId });
        }

        // 3. Re-evaluar estado
        return await this.verifyStatus(productId);
    }

    static async verifyStatus(productId) {
        const ingredients = await QueryBuilder.all(`
            SELECT s.is_active FROM product_supplies ps 
            JOIN supplies s ON ps.supply_id = s.id 
            WHERE ps.product_id = ?`, [productId]);

        // Un producto solo es activo si tiene ingredientes y todos están activos
        const isActive = (ingredients.length > 0 && ingredients.every(i => i.is_active === 1)) ? 1 : 0;
        
        await QueryBuilder.run("UPDATE products SET is_active = ? WHERE id = ?", [isActive, productId]);
        console.log(`[PRODUCT SERVICE] Estado Producto ${productId}: ${isActive === 1 ? 'ACTIVO' : 'INACTIVO'}`);
        return isActive;
    }

    static async delete(id) {
        // Al borrar el producto, se borra la receta por FK (CASCADE)
        return await QueryBuilder.run("DELETE FROM products WHERE id = ?", [id]);
    }
}

module.exports = ProductService;