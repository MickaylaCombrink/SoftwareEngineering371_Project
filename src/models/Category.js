const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category name is required.'],
    unique: true,
  },
  description: { type: String, required: [true, 'Description is required.'] },
});

// category already carries a unique index from its field definition

module.exports = mongoose.model('Category', categorySchema);
