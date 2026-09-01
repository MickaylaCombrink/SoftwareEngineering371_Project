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

module.exports = mongoose.model('Product', productSchema);
