const express = require('express');
const router = express.Router();
const ctrl = require('./products.controller');

router.get('/', ctrl.getAll);
router.post('/create', ctrl.create); // Aquí unificamos la lógica de inducción/creación
router.put('/update/:id', ctrl.update);
router.delete('/delete/:id', ctrl.delete);

module.exports = router;