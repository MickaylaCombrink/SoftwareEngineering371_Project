const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// GET /api/cart
exports.getCart = catchAsync(async (req, res, next) => {
  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    cart = await Cart.create({ userId: req.user._id, items: [] });
  }
  res.status(200).json({ status: 'success', data: { cart } });
});

// POST /api/cart/items
// Test case: "Adding a quantity exceeding available stock -> 422; cart
// unchanged, error message".
// Test case: "Add the same product twice -> quantities combine into one
// line item, subtotal correct".
exports.addItem = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return next(new AppError('A valid productId and quantity are required.', 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('No product found with that ID.', 404));
  }

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    cart = await Cart.create({ userId: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId
  );
  const requestedTotal = (existingItem ? existingItem.quantity : 0) + quantity;

  // Stock check happens BEFORE any mutation, and the function returns
  // immediately on failure — this is what keeps "cart unchanged" true.
  if (requestedTotal > product.stock) {
    return next(
      new AppError(
        `Only ${product.stock} unit(s) of ${product.productName} available.`,
        422
      )
    );
  }

  if (existingItem) {
    existingItem.quantity = requestedTotal;
  } else {
    cart.items.push({
      productId: product._id,
      name: product.productName,
      unitPrice: product.price,
      quantity,
    });
  }

  await cart.save();
  res.status(200).json({ status: 'success', data: { cart } });
});

// PUT /api/cart/items/:productId
exports.updateItemQuantity = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  if (!quantity || quantity < 1) {
    return next(new AppError('Quantity must be at least 1.', 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('No product found with that ID.', 404));
  }

  if (quantity > product.stock) {
    return next(
      new AppError(`Only ${product.stock} unit(s) available.`, 422)
    );
  }

  const cart = await Cart.findOne({ userId: req.user._id });
  const item = cart && cart.items.find((i) => i.productId.toString() === productId);

  if (!item) {
    return next(new AppError('That item is not in your cart.', 404));
  }

  item.quantity = quantity;
  await cart.save();
  res.status(200).json({ status: 'success', data: { cart } });
});

// DELETE /api/cart/items
exports.removeItem = catchAsync(async (req, res, next) => {
  const { productId } = req.body;
  const cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    return next(new AppError('Cart not found.', 404));
  }

  const originalLength = cart.items.length;
  cart.items = cart.items.filter((i) => i.productId.toString() !== productId);

  if (cart.items.length === originalLength) {
    return next(new AppError('That item is not in your cart.', 404));
  }

  await cart.save();
  res.status(200).json({ status: 'success', data: { cart } });
});
