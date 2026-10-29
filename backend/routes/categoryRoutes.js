const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', authorizeRole('admin'), categoryController.createCategory);
router.put('/:id', authorizeRole('admin'), categoryController.updateCategory);
router.delete('/:id', authorizeRole('admin'), categoryController.deleteCategory);

module.exports = router;
