const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Check if controller functions exist
console.log('Auth Controller loaded:', Object.keys(authController));

// Public routes (no authentication needed)
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.get('/check-session', authController.checkSession);

module.exports = router;
