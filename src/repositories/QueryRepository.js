const BaseRepository = require('./BaseRepository');
const Query = require('../models/Query');

class QueryRepository extends BaseRepository {
  constructor() {
    super(Query);
  }

  // Contact queries in newest-first order - the admin queue listing
  async findAllNewestFirst() {
    return this.findAll({}, { sort: { createdAt: -1 } });
  }
}

module.exports = new QueryRepository();
module.exports.QueryRepository = QueryRepository;