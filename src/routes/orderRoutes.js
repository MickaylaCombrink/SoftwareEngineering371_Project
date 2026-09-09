const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(orderController.createOrder)
  .get(orderController.getMyOrders);

// Must be registered before /:id so "all" is not treated as an order id
router.get('/all', restrictTo('admin'), orderController.getAllOrders);

router.get('/:id', orderController.getOrder);
router.put('/:id/status', restrictTo('admin'), orderController.updateOrderStatus);

module.exports = router;
