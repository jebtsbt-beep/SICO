/**
 * helpers/entityProcessor.js
 */
const QueryBuilder = require('../models/queryBuilder');
const DIMENSIONS = require('../config/dimensions');

class EntityProcessor {
    static async process(items, config, parentId = null, context = {}) {
        if (!items || !Array.isArray(items)) return;

        for (const item of items) {
            try {
                let entityId = item[config.idField];
            const entityName = item.supplyName || item.name || "Entidad";

            // LOG: Inicio de procesamiento
            console.log(`\x1b[36m[DIMENSIÓN: ${config.key || 'Principal'}]\x1b[0m Procesando: ${entityName}`);

            // 1. EXISTENCIA / CREACIÓN
            if (!entityId && config.checkExistsSql) {
                const params = config.getCheckParams(item, context);
                const existing = await QueryBuilder.get(config.checkExistsSql, params);
                entityId = existing ? existing.id : null;
                if (entityId) console.log(`   -> ✨ Encontrado existente (ID: ${entityId})`);
            }

            if (!entityId) {
                const params = config.getInsertParams(item, context);
                const res = await QueryBuilder.run(config.insertSql, params);
                entityId = res.id;
                console.log(`   -> 🆕 Creado nuevo (ID: ${entityId})`);
            } else if (config.updateSql) { 
                const upParams = config.getUpdateParams(item, entityId);
                await QueryBuilder.run(config.updateSql, upParams);
                console.log(`   -> 🔄 Maestro actualizado (ID: ${entityId})`);
            }

            // 2. VINCULACIÓN
            if (config.linkSql && parentId) {
                const checkParams = config.getCheckLinkParams(item, entityId, parentId);
                const linkExisting = await QueryBuilder.get(config.checkLinkSql, checkParams);
                
                if (linkExisting) {
                    const upParams = config.getUpdateLinkParams(item, linkExisting.id);
                    await QueryBuilder.run(config.updateLinkSql, upParams);
                    console.log(`   -> 🔄 Vínculo actualizado con Padre ID: ${parentId}`);
                } else {
                    const insParams = config.getLinkParams(item, entityId, parentId);
                    await QueryBuilder.run(config.linkSql, insParams);
                    console.log(`   -> 🔗 Nuevo vínculo creado con Padre ID: ${parentId}`);
                }
            }

            // 3. RECURSIVIDAD (Bajar a la siguiente dimensión)
            if (config.subDimensionKey && item[DIMENSIONS[config.subDimensionKey].key]) {
                const subConfig = DIMENSIONS[config.subDimensionKey];
                await this.process(item[subConfig.key], subConfig, entityId, context);
            }

            // 4. POST-PROCESO (Subir activación)
            if (config.afterProcess) {
                await config.afterProcess(entityId);
            }

            } catch (err) {
                // Si falla, imprimimos exactamente qué estaba haciendo para depurar
                console.error(`[ENTITY PROCESSOR ERROR] en dimensión: ${config.key || 'Unknown'}`);
                console.error(`Objeto procesado:`, item);
                console.error(`Mensaje original: ${err.message}`);
                throw err; // Re-lanzamos para que el controlador haga Rollback
            }
        }
    }
}

module.exports = EntityProcessor;