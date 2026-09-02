const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter, loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Broad ceiling across every auth endpoint
router.use(authLimiter);

router.post('/register', authController.register);
// ...and a tighter one on login, where password guessing happens
router.post('/login', loginLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.get('/me', protect, authController.getMe);

module.exports = router;
