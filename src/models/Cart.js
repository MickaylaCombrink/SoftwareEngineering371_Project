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

// ---------------------------------------------------------------------
// Indexes
// `userId` already has a unique index from the field definition above —
// that is what enforces exactly one cart per user.
// ---------------------------------------------------------------------

// "Is this product in anyone's cart?" — used when a product is edited
// or deleted so stale line items can be found.
cartSchema.index({ 'items.productId': 1 });

module.exports = mongoose.model('Cart', cartSchema);
