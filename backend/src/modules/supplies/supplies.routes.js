const express = require('express');
const router = express.Router();
const ctrl = require('./supplies.controller');

router.get('/', ctrl.getAllSupplies);
router.put('/:id', ctrl.updateSupply);
router.delete('/:id', ctrl.deleteSupply);

module.exports = router;