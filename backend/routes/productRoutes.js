const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/alerts/low-stock', productController.getLowStockAlerts);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', authorizeRole('admin'), productController.createProduct);
router.put('/:id', authorizeRole('admin'), productController.updateProduct);
router.delete('/:id', authorizeRole('admin'), productController.deleteProduct);

module.exports = router;
