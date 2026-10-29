const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/transactions', stockController.getAllStockTransactions);
router.post('/transactions', stockController.recordStockTransaction);

module.exports = router;
