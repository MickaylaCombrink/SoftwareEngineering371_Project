/**
 * BaseRepository
 *
 * Repository pattern (System Plan > Design Patterns Choice): the data
 * access layer sits between the controllers and Mongoose, so controllers
 * never build queries themselves and the persistence library can be
 * swapped or mocked without touching HTTP code.
 *
 * Every model repository extends this class and inherits the standard
 * CRUD set; model-specific queries are added as methods on the subclass.
 *
 * Note on errors: these methods return null for "not found" rather than
 * throwing. Deciding that a missing document is a 404 is an HTTP concern
 * and stays in the controller, where AppError lives.
 */
class BaseRepository {
  /**
   * @param {import('mongoose').Model} model A Mongoose model.
   */
  constructor(model) {
    if (!model) {
      throw new Error('BaseRepository requires a Mongoose model.');
    }
    this.model = model;
  }

  /**
   * Find many documents.
   * @param {object} filter   Mongo filter, e.g. { stock: { $gt: 0 } }
   * @param {object} options  { sort, limit, skip, select, populate, session }
   */
  async findAll(filter = {}, options = {}) {
    const { sort, limit, skip, select, populate, session } = options;

    let query = this.model.find(filter);

    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    if (sort) query = query.sort(sort);
    if (typeof skip === 'number') query = query.skip(skip);
    if (typeof limit === 'number') query = query.limit(limit);
    if (session) query = query.session(session);

    return query.exec();
  }

  /**
   * Find a single document by its _id. Returns null when absent.
   * An invalid ObjectId throws a CastError, which the global error
   * handler converts into a 400.
   */
  async findById(id, options = {}) {
    const { select, populate, session } = options;

    let query = this.model.findById(id);

    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    if (session) query = query.session(session);

    return query.exec();
  }

  /** Find the first document matching a filter, or null. */
  async findOne(filter, options = {}) {
    const { select, populate, session } = options;

    let query = this.model.findOne(filter);

    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    if (session) query = query.session(session);

    return query.exec();
  }

  /**
   * Create one document. Pass { session } inside a transaction — the
   * array form of Model.create is used because that is the only form
   * Mongoose accepts a session with.
   */
  async create(data, options = {}) {
    const { session } = options;

    if (session) {
      const [doc] = await this.model.create([data], { session });
      return doc;
    }
    return this.model.create(data);
  }

  /**
   * Update by _id and return the UPDATED document (or null).
   * Validators run on update, so schema rules (min price, enums, ...)
   * are enforced on edits as well as on inserts.
   */
  async updateById(id, update, options = {}) {
    const { session, populate } = options;

    let query = this.model.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
      ...options.queryOptions,
    });

    if (populate) query = query.populate(populate);
    if (session) query = query.session(session);

    return query.exec();
  }

  /** Delete by _id. Returns the deleted document, or null if absent. */
  async deleteById(id, options = {}) {
    const { session } = options;

    let query = this.model.findByIdAndDelete(id);
    if (session) query = query.session(session);

    return query.exec();
  }

  /** Count documents matching a filter. */
  async count(filter = {}) {
    return this.model.countDocuments(filter).exec();
  }

  /** True when at least one document matches. */
  async exists(filter) {
    const found = await this.model.exists(filter);
    return Boolean(found);
  }
}

module.exports = BaseRepository;
