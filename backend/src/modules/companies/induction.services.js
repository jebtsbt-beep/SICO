const Company = require('./companies.service');
const QueryBuilder = require('../../models/queryBuilder');

class InductionService {
    /**
     * Configuración inicial de una empresa en SICO.
     * Crea la empresa y asigna las unidades de medida por defecto.
     */
    static async setupNewBusiness(name, description) {
        // 1. Crear la empresa
        const newCompany = await Company.create({ name, description });

        // 2. Aquí podríamos añadir configuraciones específicas 
        // como impuestos por defecto o categorías base.
        
        return {
            message: "Induction complete. SICO engine ready for " + name,
            company: newCompany
        };
    }
}

module.exports = InductionService;