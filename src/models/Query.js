const mongoose = require('mongoose');

const querySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required.'] },
    email: { type: String, required: [true, 'Email is required.'] },
    subject: { type: String, required: [true, 'Subject is required.'] },
    message: { type: String, required: [true, 'Message is required.'] },
    status: {
      type: String,
      enum: {
        values: ['new', 'in-progress', 'resolved'],
        message: '{VALUE} is not a valid status.',
      },
      default: 'new',
    },
  },
  { timestamps: true }
);

// Admin queues list newest queries first
querySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Query', querySchema);