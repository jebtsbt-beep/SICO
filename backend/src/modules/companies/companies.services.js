const QueryBuilder = require('../../models/queryBuilder');

class Company {
    constructor(id, name, description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    // Método estático para crear una nueva unidad de negocio en SICO
    static async create({ name, description }) {
        const sql = `INSERT INTO companies (name, description) VALUES (?, ?)`;
        const result = await QueryBuilder.run(sql, [name, description]);
        return new Company(result.id, name, description);
    }

    // Método para obtener los datos de una empresa específica
    static async getById(id) {
        const sql = `SELECT * FROM companies WHERE id = ?`;
        const data = await QueryBuilder.get(sql, [id]);
        if (!data) throw new Error("Company not found");
        return new Company(data.id, data.name, data.description);
    }

    // Listar todas las empresas del sistema (Vista de SuperAdmin)
    static async getAll() {
        const sql = `SELECT * FROM companies`;
        return await QueryBuilder.all(sql);
    }
}

module.exports = Company;