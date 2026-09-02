const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  // Look a user up by email. The password hash is excluded
  async findByEmail(email) {
    return this.findOne({ email: String(email).toLowerCase() });
  }

  // Login path: same lookup, but with the password hash
  async findByEmailWithPassword(email) {
    return this.findOne({ email: String(email).toLowerCase() }, { select: '+password' });
  }

  // Cheap existence check for the "email already in use -> 409" rule
  async emailExists(email) {
    return this.exists({ email: String(email).toLowerCase() });
  }
}

module.exports = new UserRepository();
module.exports.UserRepository = UserRepository;
