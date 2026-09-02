const BaseRepository = require('./BaseRepository');
const Cart = require('../models/Cart');

class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  /** One cart per user — the unique index on userId guarantees it. */
  async findByUser(userId, options = {}) {
    return this.findOne({ userId }, options);
  }

  /**
   * Fetch the user's cart, creating an empty one on first use so callers
   * never have to handle "no cart yet" as a special case.
   */
  async findOrCreateByUser(userId) {
    const existing = await this.findByUser(userId);
    if (existing) return existing;

    return this.create({ userId, items: [] });
  }

  /** Empty the cart after a successful checkout. */
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
