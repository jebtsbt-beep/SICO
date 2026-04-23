const express = require('express');
const router = express.Router();
const ctrl = require('./companies.controller');

// Estándar SICO: Verbo en la ruta para claridad total
router.get('/', ctrl.getAll);
router.post('/create', ctrl.create);
router.put('/update/:id', ctrl.update);
router.delete('/delete/:id', ctrl.delete);

module.exports = router;