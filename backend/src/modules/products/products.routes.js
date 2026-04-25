const express = require('express');
const router = express.Router();
const ctrl = require('./products.controller');

router.get('/:companyId', ctrl.getAll);
router.post('/create', ctrl.create);
router.put('/update/:id', ctrl.update);
router.delete('/delete/:id', ctrl.delete);


module.exports = router;