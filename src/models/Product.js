const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: [true, 'Product name is required.'] },
    description: { type: String, required: [true, 'Description is required.'] },
    price: {
      type: Number,
      required: [true, 'Price is required.'],
      min: [0, 'Price cannot be negative.'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required.'],
      min: [0, 'Stock cannot be negative.'],
      default: 0,
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    image: [{ type: String }],
  },
  { timestamps: true }
);

// Indexes mirror the filters productRepository.search() builds

// Equality field first, then the range field
productSchema.index({ category: 1, price: 1 });

// Price-only range queries, and price sorting
productSchema.index({ price: 1 });

// ?inStock=true
productSchema.index({ stock: 1 });

// Default catalogue ordering (newest first)
productSchema.index({ createdAt: -1 });

// Free-text search over the fields a shopper would type into a search box
productSchema.index(
  { productName: 'text', description: 'text' },
  { weights: { productName: 10, description: 1 }, name: 'product_text_search' }
);

module.exports = mongoose.model('Product', productSchema);
