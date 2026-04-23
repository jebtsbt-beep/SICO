const QueryBuilder = require('../../models/queryBuilder');

class Company {
    static async getAll() {
        return await QueryBuilder.all("SELECT * FROM companies");
    }

    static async getById(id) {
        return await QueryBuilder.get("SELECT * FROM companies WHERE id = ?", [id]);
    }

    static async create(data) {
        try {
            await QueryBuilder.beginTransaction();
            const sql = `INSERT INTO companies (name, description) VALUES (?, ?)`;
            const res = await QueryBuilder.run(sql, [data.name, data.description]);
            await QueryBuilder.commit();
            return res.id;
        } catch (error) {
            await QueryBuilder.rollback();
            throw error;
        }
    }

    static async update(id, data) {
        try {
            await QueryBuilder.beginTransaction();
            const sql = `UPDATE companies SET name = ?, description = ? WHERE id = ?`;
            await QueryBuilder.run(sql, [data.name, data.description, id]);
            await QueryBuilder.commit();
        } catch (error) {
            await QueryBuilder.rollback();
            throw error;
        }
    }

    static async delete(id) {
        try {
            await QueryBuilder.beginTransaction();

            // 1. Verificación de Integridad: ¿Tiene productos o insumos asociados?
            const hasProducts = await QueryBuilder.get("SELECT id FROM products WHERE company_id = ?", [id]);
            const hasSupplies = await QueryBuilder.get("SELECT id FROM supplies WHERE company_id = ?", [id]);

            if (hasProducts || hasSupplies) {
                throw new Error("INTEGRITY_ERR: No se puede eliminar la empresa porque tiene productos o insumos vinculados.");
            }

            // 2. Ejecutar eliminación
            const res = await QueryBuilder.run("DELETE FROM companies WHERE id = ?", [id]);
            
            await QueryBuilder.commit();
            return res;
        } catch (error) {
            await QueryBuilder.rollback();
            throw error;
        }
    }
}

module.exports = Company;