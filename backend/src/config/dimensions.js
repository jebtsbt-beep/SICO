/**
 * config/dimensions.js
 */
const DIMENSIONS = {
    PROVIDERS: {
        key: 'providers',
        idField: 'providerId',
        checkExistsSql: "SELECT id FROM providers WHERE nit = ?",
        getCheckParams: (p) => [p.nit],
        insertSql: "INSERT INTO providers (nit, name, phone, email) VALUES (?, ?, ?, ?)",
        getInsertParams: (p) => [p.nit, p.name, p.phone || "", p.email || ""],
        
        checkLinkSql: "SELECT id FROM provider_supplies WHERE supply_id = ? AND provider_id = ?",
        getCheckLinkParams: (item, providerId, supplyId) => {
            console.log(`[DEBUG] Buscando vínculo: Insumo ${supplyId} + Proveedor ${providerId}`);
            return [supplyId, providerId];
        },
        
        // INSERT con COALESCE por si acaso
        linkSql: `INSERT INTO provider_supplies 
                  (supply_id, provider_id, provider_item_code, purchase_unit_id, conversion_factor, last_price) 
                  VALUES (?, ?, COALESCE(?, 'PENDIENTE'), COALESCE(?, 1), COALESCE(?, 1), COALESCE(?, 0))`,
        getLinkParams: (p, provId, parentId) => [
            parentId, provId, p.providerItemCode || null, p.purchaseUnitId || null, p.conversionFactor || null, p.initialPrice || null
        ],
        
        // ESTO DEBE ESTAR AQUÍ, EN PROVIDERS
        updateLinkSql: `UPDATE provider_supplies 
                        SET provider_item_code = COALESCE(?, provider_item_code), 
                            purchase_unit_id = COALESCE(?, purchase_unit_id), 
                            conversion_factor = COALESCE(?, conversion_factor), 
                            last_price = COALESCE(?, last_price) 
                        WHERE id = ?`,
        getUpdateLinkParams: (p, linkId) => [
            p.providerItemCode || null, 
            p.purchaseUnitId || null, 
            p.conversionFactor || null, 
            p.initialPrice || null, 
            linkId
        ],

        updateSql: `UPDATE providers 
            SET name = COALESCE(?, name), 
                phone = COALESCE(?, phone), 
                email = COALESCE(?, email) 
            WHERE id = ?`,
        getUpdateParams: (p, entityId) => [
            p.name || null, p.phone || null, p.email || null, entityId
        ]
    },

    SUPPLIES: {
        key: 'ingredients', 
        idField: 'supplyId',
        checkExistsSql: "SELECT id FROM supplies WHERE name = ? AND company_id = ?",
        getCheckParams: (s, context) => [s.supplyName, context.companyId],    
        updateSql: `UPDATE supplies 
                    SET name = COALESCE(?, name), 
                        base_unit_id = COALESCE(?, base_unit_id) 
                    WHERE id = ?`,
        getUpdateParams: (s, entityId) => [
            s.supplyName || null, s.baseUnitId || null, entityId
        ],  
        insertSql: "INSERT INTO supplies (company_id, name, base_unit_id, is_active) VALUES (?, ?, ?, 0)",
        getInsertParams: (s, context) => [context.companyId, s.supplyName, s.baseUnitId],
        
        checkLinkSql: "SELECT id FROM product_supplies WHERE product_id = ? AND supply_id = ?",
        getCheckLinkParams: (s, entityId, parentId) => [parentId, entityId],
        
        linkSql: `INSERT INTO product_supplies 
                  (product_id, supply_id, unit_id, base_quantity, waste_factor) 
                  VALUES (?, ?, ?, ?, ?)`,
        getLinkParams: (s, supplyId, parentId) => [
            parentId, supplyId, s.recipeUnitId, s.quantityPerProduct, s.wasteFactor
        ],
        
        // UPDATE de la relación Producto-Insumo
        updateLinkSql: `UPDATE product_supplies 
                        SET unit_id = COALESCE(?, unit_id), 
                            base_quantity = COALESCE(?, base_quantity), 
                            waste_factor = COALESCE(?, waste_factor) 
                        WHERE id = ?`,
        getUpdateLinkParams: (s, linkId) => [
            s.recipeUnitId || null, s.quantityPerProduct || null, s.wasteFactor || null, linkId
        ],

        afterProcess: async (supplyId) => {
            const SupplyService = require('../modules/supplies/supplies.service');
            await SupplyService.verifyStatus(supplyId);
        },
        subDimensionKey: 'PROVIDERS'
    }
};

module.exports = DIMENSIONS;