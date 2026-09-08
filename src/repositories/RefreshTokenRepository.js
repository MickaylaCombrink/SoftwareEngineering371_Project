const BaseRepository = require('./BaseRepository');
const RefreshToken = require('../models/RefreshToken');

class RefreshTokenRepository extends BaseRepository {
  constructor() {
    super(RefreshToken);
  }

  // Record a newly issued token. expiresAt comes from the JWT's own exp claim
  async issue(userId, token, expiresAt) {
    return this.create({
      tokenHash: RefreshToken.hash(token),
      userId,
      expiresAt,
    });
  }

  // True only for a token that exists, is not revoked and has not expired
  async isActive(token) {
    const found = await this.findOne({
      tokenHash: RefreshToken.hash(token),
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    return Boolean(found);
  }

  // Marked revoked rather than deleted, so a replayed token is distinguishable
  // from one that never existed
  async revoke(token) {
    return this.model
      .findOneAndUpdate(
        { tokenHash: RefreshToken.hash(token), revokedAt: null },
        { revokedAt: new Date() },
        { new: true }
      )
      .exec();
  }

  // Used on logout-everywhere, and after a password change
  async revokeAllForUser(userId) {
    const result = await this.model
      .updateMany({ userId, revokedAt: null }, { revokedAt: new Date() })
      .exec();

    return result.modifiedCount;
  }
}

module.exports = new RefreshTokenRepository();
module.exports.RefreshTokenRepository = RefreshTokenRepository;
