const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    // Price snapshot, so later price changes never alter historic orders
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: {
      type: [orderItemSchema],
      validate: [(arr) => arr.length > 0, 'An order must contain at least one item.'],
    },
    totalPrice: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Shipping', 'Delivered'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Indexes

// GET /api/orders - a user's own order history, newest first
orderSchema.index({ userId: 1, createdAt: -1 });

// Admin fulfilment queue
orderSchema.index({ orderStatus: 1, createdAt: -1 });

// Reconciling payments / retrying failed ones
orderSchema.index({ paymentStatus: 1 });

// Sales reporting: every order line containing a product
orderSchema.index({ 'items.productId': 1 });

module.exports = mongoose.model('Order', orderSchema);
