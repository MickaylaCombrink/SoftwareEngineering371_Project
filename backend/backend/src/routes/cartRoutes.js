const express = require('express');
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // every cart route requires a logged-in user

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:productId', cartController.updateItemQuantity);
router.delete('/items', cartController.removeItem);

module.exports = router;
