/**
 * UNASSIGNED — Orders.
 *
 * Handlers: createOrder (checkout), getMyOrders, getOrder (owner or
 * admin), updateOrderStatus (admin only). HTTP concerns only — the rules
 * live in orderService.
 */
const catchAsync = require('../utils/catchAsync');
const orderService = require('../services/orderService');

// POST /api/orders — checkout
exports.createOrder = catchAsync(async (req, res, next) => {
  const order = await orderService.checkout(req.user.id);
  res.status(201).json({ status: 'success', data: { order } });
});

// GET /api/orders — my orders, newest first
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await orderService.getMyOrders(req.user.id);
  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders },
  });
});

// GET /api/orders/:id — owner or admin only
exports.getOrder = catchAsync(async (req, res, next) => {
  const isAdmin = req.user.role === 'admin';
  const order = await orderService.getOrder(req.params.id, req.user.id, { isAdmin });
  res.status(200).json({ status: 'success', data: { order } });
});

// PUT /api/orders/:id/status — admin only
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const isAdmin = req.user.role === 'admin';
  const order = await orderService.updateStatus(
    req.params.id,
    req.body.orderStatus,
    { isAdmin }
  );
  res.status(200).json({ status: 'success', data: { order } });
});
