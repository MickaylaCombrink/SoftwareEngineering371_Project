const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category name is required.'],
    unique: true,
  },
  description: { type: String, required: [true, 'Description is required.'] },
});

module.exports = mongoose.model('Category', categorySchema);
