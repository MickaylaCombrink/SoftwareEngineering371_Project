const BaseRepository = require('./BaseRepository');
const Product = require('../models/Product');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  /**
   * Translates the catalogue query string into a Mongo filter.
   * Kept here rather than in the controller so the filter shape and the
   * indexes it relies on (category, price, stock) live side by side.
   *
   * @param {object} query { category, minPrice, maxPrice, inStock, sort }
   */
  async search(query = {}) {
    const { category, minPrice, maxPrice, inStock, sort } = query;
    const filter = {};

    if (category) filter.category = category;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && minPrice !== '') filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') filter.price.$lte = Number(maxPrice);
    }

    if (inStock === true || inStock === 'true') filter.stock = { $gt: 0 };

    return this.findAll(filter, { sort: sort || { createdAt: -1 } });
  }

  /** Products belonging to one category. */
  async findByCategory(categoryId) {
    return this.findAll({ category: categoryId });
  }

  /**
   * Atomically decrement stock only if enough is available.
   * Returns the updated product, or null when stock was insufficient —
   * which stops two simultaneous checkouts overselling the same unit.
   */
  async decrementStock(productId, quantity, options = {}) {
    const { session } = options;

    let query = this.model.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    );

    if (session) query = query.session(session);

    return query.exec();
  }
}

module.exports = new ProductRepository();
module.exports.ProductRepository = ProductRepository;
