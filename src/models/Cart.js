const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1.'] },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// userId already has a unique index from its field definition: one cart per user

// Find stale line items when a product is edited or deleted
cartSchema.index({ 'items.productId': 1 });

module.exports = mongoose.model('Cart', cartSchema);
