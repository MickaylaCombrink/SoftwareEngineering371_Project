const catchAsync = require('../utils/catchAsync');
const cartService = require('../services/cartService');

// GET /api/cart
exports.getCart = catchAsync(async (req, res, next) => {
  const result = await cartService.getCart(req.user.id);
  res.status(200).json({
    status: 'success',
    itemCount: result.itemCount,
    subtotal: result.subtotal,
    data: { cart: result.cart },
  });
});

// POST /api/cart/items
exports.addItem = catchAsync(async (req, res, next) => {
  const result = await cartService.addItem(req.user.id, req.body);
  res.status(200).json({
    status: 'success',
    itemCount: result.itemCount,
    subtotal: result.subtotal,
    data: { cart: result.cart },
  });
});

// PUT /api/cart/items/:productId
exports.updateItemQuantity = catchAsync(async (req, res, next) => {
  const result = await cartService.changeQuantity(
    req.user.id,
    req.params.productId,
    req.body
  );
  res.status(200).json({
    status: 'success',
    itemCount: result.itemCount,
    subtotal: result.subtotal,
    data: { cart: result.cart },
  });
});

// DELETE /api/cart/items
exports.removeItem = catchAsync(async (req, res, next) => {
  const result = await cartService.removeItem(req.user.id, req.body.productId);
  res.status(200).json({
    status: 'success',
    itemCount: result.itemCount,
    subtotal: result.subtotal,
    data: { cart: result.cart },
  });
});
