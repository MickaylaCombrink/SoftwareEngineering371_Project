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

// email already has a unique index from its field definition: do not redeclare it

// Admin user listing: filter by role, newest first
userSchema.index({ role: 1, createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
