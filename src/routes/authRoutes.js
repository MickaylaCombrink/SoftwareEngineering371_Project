/**
 * PERSON 2 — Login and Security.  NOT IMPLEMENTED.
 *
 * Suggested route table:
 *   POST /register
 *   POST /login
 *   POST /refresh
 *   POST /logout
 *   GET  /me      (protect)
 *
 * Once the handlers exist, uncomment the /api/auth mount in src/app.js.
 */
const express = require('express');
const authController = require('../controllers/authController');
const {protect} = require('../middleware/auth');

const router = express.Router();


// TODO: router.post('/register', authController.register); etc.

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.get('/me', protect, authController.getMe);




module.exports = router;
