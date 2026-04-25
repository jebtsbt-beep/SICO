const express = require('express');
const router = express.Router();
const ctrl = require('./providers.controller');

// CRUD Básico
router.get('/:companyId', ctrl.getAll);
router.post('/create', ctrl.create);
router.put('/update/:id', ctrl.update);
router.delete('/delete/:id', ctrl.delete);
// Vínculos con Insumos (NUEVO)
router.post('/link', ctrl.link);
router.post('/unlink', ctrl.unlink);

module.exports = router;