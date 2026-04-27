const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Conexión de Rutas a los Pilares de SICO
app.use('/api/providers', require('./modules/providers/providers.routes'));
app.use('/api/supplies', require('./modules/supplies/supplies.routes'));
app.use('/api/products', require('./modules/products/products.routes'));
app.use('/api/companies', require('./modules/companies/companies.routes'));

module.exports = app;
