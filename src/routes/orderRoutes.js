/**
 * UNASSIGNED — Orders.
 *
 * Route table (all behind Person 2's `protect`):
 *   POST /            checkout
 *   GET  /            my orders
 *   GET  /:id         one order, owner or admin only
 *   PUT  /:id/status  admin only (restrictTo('admin'))
 */
const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(orderController.createOrder)
  .get(orderController.getMyOrders);

router.get('/:id', orderController.getOrder);
router.put('/:id/status', restrictTo('admin'), orderController.updateOrderStatus);

module.exports = router;
