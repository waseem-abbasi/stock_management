const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', supplierController.getAllSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.post('/', authorizeRole('admin'), supplierController.createSupplier);
router.put('/:id', authorizeRole('admin'), supplierController.updateSupplier);
router.delete('/:id', authorizeRole('admin'), supplierController.deleteSupplier);

module.exports = router;
