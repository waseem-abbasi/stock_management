const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-code', authController.verifyResetCode);
router.post('/reset-password', authController.resetPassword);
router.post('/register', authenticateToken, authorizeRole('admin'), authController.register);
router.get('/profile', authenticateToken, authController.getProfile);
router.get('/users', authenticateToken, authorizeRole('admin'), authController.listUsers);

module.exports = router;
