const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, 'First name is required.'] },
    lastName: { type: String, required: [true, 'Last name is required.'] },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true, // combined with handleDuplicateFieldsDB -> 409 on register
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [8, 'Password must be at least 8 characters long.'],
      select: false, // never returned by default queries
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------
// Indexes
// `email` already has a unique index from the field definition above
// (that index is what makes a duplicate registration fail with 11000,
// which errorHandler turns into a 409) — it must not be redeclared here.
// ---------------------------------------------------------------------

// Admin user listing: filter by role, newest first.
userSchema.index({ role: 1, createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
