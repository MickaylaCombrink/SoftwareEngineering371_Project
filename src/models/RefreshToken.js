const crypto = require('crypto');
const mongoose = require('mongoose');

// Stored as a SHA-256 hash, never in plaintext
const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// TTL index: Mongo removes each row once expiresAt passes
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Revoking every session for one user, and listing a user's sessions
refreshTokenSchema.index({ userId: 1, revokedAt: 1 });

refreshTokenSchema.statics.hash = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
