const BaseRepository = require('./BaseRepository');
const Category = require('../models/Category');

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  /** Categories in alphabetical order — the default listing. */
  async findAllSorted() {
    return this.findAll({}, { sort: { category: 1 } });
  }

  async findByName(name) {
    return this.findOne({ category: name });
  }
}

module.exports = new CategoryRepository();
module.exports.CategoryRepository = CategoryRepository;
