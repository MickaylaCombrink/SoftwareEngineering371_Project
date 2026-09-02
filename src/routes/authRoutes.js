/**
 * PERSON 2 — Login and Security.
 *
 * Route table:
 *   POST /register
 *   POST /login
 *   POST /refresh
 *   POST /logout
 *   GET  /me      (protect)
 */
const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');
const {protect} = require('../middleware/auth');
const {authLimiter, loginLimiter} = require('../middleware/rateLimiter');

const router = express.Router();

router.use(authLimiter)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.get('/me', protect, authController.getMe);




module.exports = router;
