const QueryBuilder = require('../../models/queryBuilder');
const Supply = require('../supplies/supplies.service');

class Product {
    static async getAll(companyId) {
        const sql = `SELECT p.*, c.name as company_name FROM products p 
                     JOIN companies c ON p.company_id = c.id WHERE p.company_id = ?`;
        return await QueryBuilder.all(sql, [companyId]);
    }

    static async inductFullProduct(companyId, productData, ingredients) {
        // Lógica ya planteada de inserción múltiple...
        const productSql = `INSERT INTO products (company_id, barcode, name, sale_price) VALUES (?, ?, ?, ?)`;
        const productResult = await QueryBuilder.run(productSql, [companyId, productData.barcode, productData.name, productData.salePrice]);
        const productId = productResult.id;

        for (const item of ingredients) {
            const supplyId = await Supply.create({ companyId, name: item.supplyName, baseUnitId: item.baseUnitId });
            await Supply.linkToProvider({ supplyId, providerId: item.providerId, itemCode: item.providerItemCode, unitId: item.purchaseUnitId, factor: item.conversionFactor, price: item.initialPrice });
            await QueryBuilder.run(`INSERT INTO product_supplies (product_id, supply_id, unit_id, base_quantity, waste_factor) VALUES (?, ?, ?, ?, ?)`, 
                [productId, supplyId, item.recipeUnitId, item.quantityPerProduct, item.wasteFactor || 1.00]);
        }
        return productId;
    }

    // UPDATE: Datos básicos (Nombre, Precio, Estado)
    static async update(id, { name, salePrice, isActive, barcode }) {
        const sql = `UPDATE products SET name = ?, sale_price = ?, is_active = ?, barcode = ? WHERE id = ?`;
        return await QueryBuilder.run(sql, [name, salePrice, isActive, barcode, id]);
    }

    // UPDATE RECIPE: Borra la receta anterior y establece una nueva
    // Esto garantiza que no queden "residuos" de ingredientes que ya no se usan
    static async updateRecipe(productId, ingredients) {
        // 1. Limpiar receta actual
        await QueryBuilder.run("DELETE FROM product_supplies WHERE product_id = ?", [productId]);

        // 2. Insertar nuevos vínculos de receta
        for (const item of ingredients) {
            const sql = `
                INSERT INTO product_supplies (product_id, supply_id, unit_id, base_quantity, waste_factor) 
                VALUES (?, ?, ?, ?, ?)`;
            await QueryBuilder.run(sql, [
                productId,
                item.supplyId,
                item.unitId,
                item.baseQuantity,
                item.wasteFactor || 1.00
            ]);
        }
        return { success: true };
    }
    
    static async delete(id) {
        await QueryBuilder.run("DELETE FROM product_supplies WHERE product_id = ?", [id]);
        return await QueryBuilder.run("DELETE FROM products WHERE id = ?", [id]);
    }
}
module.exports = Product;