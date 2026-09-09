const crypto = require('crypto');
const mongoose = require('mongoose');

// Refresh tokens are stored as a SHA-256 hash, never in plaintext, so a
// leaked database dump cannot be replayed against the API
const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Mongo removes each document once expiresAt passes, so the collection
// cannot grow without bound the way the old in-memory Set did
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Revoking every session for one user, and listing a user's sessions
refreshTokenSchema.index({ userId: 1, revokedAt: 1 });

refreshTokenSchema.statics.hash = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
