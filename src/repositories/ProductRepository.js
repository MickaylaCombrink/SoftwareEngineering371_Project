const BaseRepository = require('./BaseRepository');
const Product = require('../models/Product');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  // Builds the Mongo filter for a catalogue query string
  buildFilter(query = {}) {
    const { category, minPrice, maxPrice, inStock, q } = query;
    const filter = {};

    if (category) filter.category = category;

    // Compared against undefined/'' rather than truthiness, so minPrice=0 works
    if (minPrice !== undefined || maxPrice !== undefined) {
      const price = {};
      if (minPrice !== undefined && minPrice !== '') price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') price.$lte = Number(maxPrice);
      if (Object.keys(price).length) filter.price = price;
    }

    if (inStock === true || inStock === 'true') filter.stock = { $gt: 0 };

    // Uses the productName/description text index
    if (q) filter.$text = { $search: q };

    return filter;
  }

  // Catalogue search. Options are passed through to findAll (sort, skip, limit, populate)
  async search(query = {}, options = {}) {
    return this.findAll(this.buildFilter(query), {
      sort: query.sort || { createdAt: -1 },
      ...options,
    });
  }

  // Number of products matching a catalogue query, for pagination
  async countMatching(query = {}) {
    return this.count(this.buildFilter(query));
  }

  // Products belonging to one category
  async findByCategory(categoryId) {
    return this.findAll({ category: categoryId });
  }

  // Atomic decrement: returns null instead of overselling
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

  // Compensating write, used to roll back a failed checkout
  async incrementStock(productId, quantity, options = {}) {
    const { session } = options;

    let query = this.model.findByIdAndUpdate(
      productId,
      { $inc: { stock: quantity } },
      { new: true }
    );

    if (session) query = query.session(session);

    return query.exec();
  }
}

module.exports = new ProductRepository();
module.exports.ProductRepository = ProductRepository;
