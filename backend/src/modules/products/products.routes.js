const express = require('express');
const router = express.Router();
const ctrl = require('./products.controller');

router.get('/', ctrl.getAll);
router.post('/induct', ctrl.induct);
router.delete('/:id', ctrl.delete);
router.put('/:id', ctrl.update);

module.exports = router;