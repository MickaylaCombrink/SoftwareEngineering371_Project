// Repository pattern: shared CRUD so controllers never build queries themselves
class BaseRepository {
  constructor(model) {
    if (!model) {
      throw new Error('BaseRepository requires a Mongoose model.');
    }
    this.model = model;
  }

  // Find many documents
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

  // Find one document by _id, or null
  async findById(id, options = {}) {
    const { select, populate, session } = options;

    let query = this.model.findById(id);

    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    if (session) query = query.session(session);

    return query.exec();
  }

  // Find the first document matching a filter, or null
  async findOne(filter, options = {}) {
    const { select, populate, session } = options;

    let query = this.model.findOne(filter);

    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    if (session) query = query.session(session);

    return query.exec();
  }

  // Create one document
  async create(data, options = {}) {
    const { session } = options;

    if (session) {
      const [doc] = await this.model.create([data], { session });
      return doc;
    }
    return this.model.create(data);
  }

  // Update by _id, returning the updated document. Validators run on update
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

  // Delete by _id, returning the deleted document or null
  async deleteById(id, options = {}) {
    const { session } = options;

    let query = this.model.findByIdAndDelete(id);
    if (session) query = query.session(session);

    return query.exec();
  }

  // Count documents matching a filter
  async count(filter = {}) {
    return this.model.countDocuments(filter).exec();
  }

  // True when at least one document matches
  async exists(filter) {
    const found = await this.model.exists(filter);
    return Boolean(found);
  }
}

module.exports = BaseRepository;
