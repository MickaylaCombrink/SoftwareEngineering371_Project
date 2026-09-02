const BaseRepository = require('./BaseRepository');
const Cart = require('../models/Cart');

class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  // One cart per user, guaranteed by the unique index on userId
  async findByUser(userId, options = {}) {
    return this.findOne({ userId }, options);
  }

  // Create the cart on first use so callers never handle a missing one
  async findOrCreateByUser(userId) {
    const existing = await this.findByUser(userId);
    if (existing) return existing;

    return this.create({ userId, items: [] });
  }

  // Empty the cart after a successful checkout
  async clear(userId, options = {}) {
    const { session } = options;

    let query = this.model.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    );

    if (session) query = query.session(session);

    return query.exec();
  }
}

module.exports = new CartRepository();
module.exports.CartRepository = CartRepository;
