const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category name is required.'],
    unique: true,
  },
  description: { type: String, required: [true, 'Description is required.'] },
});

// ---------------------------------------------------------------------
// Indexes
// `category` already carries a unique index from the field definition
// above, which covers both the uniqueness rule and the alphabetical
// listing, so no further index is needed on this collection.
// ---------------------------------------------------------------------

module.exports = mongoose.model('Category', categorySchema);
