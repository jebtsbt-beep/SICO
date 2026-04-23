const QueryBuilder = require('../../models/queryBuilder');
const Supply = require('../supplies/supplies.service');
const Provider = require('../providers/providers.service');

class Product {
    static async create(companyId, productData, ingredients = []) {
        try {
            await QueryBuilder.beginTransaction();

            // 1. Crear o recuperar producto
            const productSql = `INSERT INTO products (company_id, barcode, name, sale_price, is_active) VALUES (?, ?, ?, ?, 0)`;
            const productRes = await QueryBuilder.run(productSql, [
                companyId, productData.barcode, productData.name, productData.salePrice
            ]);
            const productId = productRes.id;

            let canActivate = ingredients.length > 0;

            // 2. Procesar cada ingrediente (Supply)
            for (const ing of ingredients) {
                const supplyId = await Supply.create({
                    companyId, name: ing.supplyName, baseUnitId: ing.baseUnitId
                });

                // 3. Procesar lista de proveedores para este insumo
                if (!ing.providers || ing.providers.length === 0) canActivate = false;

                for (const prov of (ing.providers || [])) {
                    await Provider.linkToSupply({
                        supplyId,
                        providerId: prov.providerId,
                        itemCode: prov.providerItemCode,
                        unitId: prov.purchaseUnitId,
                        factor: prov.conversionFactor,
                        price: prov.initialPrice
                    });
                }

                // 4. Vincular a la receta del producto
                await QueryBuilder.run(
                    `INSERT INTO product_supplies (product_id, supply_id, unit_id, base_quantity, waste_factor) VALUES (?, ?, ?, ?, ?)`,
                    [productId, supplyId, ing.recipeUnitId, ing.quantityPerProduct, ing.wasteFactor]
                );
            }

            // 5. Activar si cumple requisitos
            if (canActivate) {
                await QueryBuilder.run("UPDATE products SET is_active = 1 WHERE id = ?", [productId]);
            }

            await QueryBuilder.commit();
            return productId;
        } catch (error) {
            await QueryBuilder.rollback();
            throw error;
        }
    }
    // ... (getAll, update, delete se mantienen con la lógica de transacción anterior)
}
module.exports = Product;