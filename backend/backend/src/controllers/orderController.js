const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// POST /api/orders
// Test case: "Successful checkout -> 201; stock decremented, cart emptied".
// Test case: "Product price changes after an order is placed -> Historic
// order retains the original unit price" — handled by copying unitPrice
// from the product at the moment of order creation, never referencing it
// live afterwards.
// Uses a Mongo transaction so a failure partway through (e.g. one item
// out of stock) cannot leave stock decremented but the order uncreated.
exports.createOrder = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.user._id });

  if (!cart || cart.items.length === 0) {
    return next(new AppError('Your cart is empty.', 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderItems = [];
    let totalPrice = 0;

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId).session(session);

      if (!product) {
        throw new AppError(`Product ${cartItem.name} no longer exists.`, 404);
      }
      if (product.stock < cartItem.quantity) {
        throw new AppError(
          `Only ${product.stock} unit(s) of ${product.productName} available.`,
          422
        );
      }

      product.stock -= cartItem.quantity;
      await product.save({ session });

      // Snapshot the CURRENT price into the order line item, so later
      // price changes on the product never retroactively affect this order.
      orderItems.push({
        productId: product._id,
        name: product.productName,
        unitPrice: product.price,
        quantity: cartItem.quantity,
      });
      totalPrice += product.price * cartItem.quantity;
    }

    const [order] = await Order.create(
      [
        {
          userId: req.user._id,
          items: orderItems,
          totalPrice,
          paymentStatus: 'Paid',
          orderStatus: 'Pending',
        },
      ],
      { session }
    );

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ status: 'success', data: { order } });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return next(err); // AppError or unexpected error both handled centrally
  }
});

// GET /api/orders
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ userId: req.user._id });
  res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
});

// GET /api/orders/:id
// Test case: "Request another user's order by id -> 403; no order data
// returned". A non-owner and a non-admin both get the same 403 — the
// check happens before any order fields are serialized into the response.
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('No order found with that ID.', 404));
  }

  const isOwner = order.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return next(new AppError('You do not have permission to view this order.', 403));
  }

  res.status(200).json({ status: 'success', data: { order } });
});

// PUT /api/orders/:id/status (Admin)
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { orderStatus } = req.body;
  const allowedStatuses = ['Pending', 'Shipping', 'Delivered'];

  if (!allowedStatuses.includes(orderStatus)) {
    return next(
      new AppError(`orderStatus must be one of: ${allowedStatuses.join(', ')}.`, 400)
    );
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus },
    { new: true, runValidators: true }
  );

  if (!order) {
    return next(new AppError('No order found with that ID.', 404));
  }

  res.status(200).json({ status: 'success', data: { order } });
});
