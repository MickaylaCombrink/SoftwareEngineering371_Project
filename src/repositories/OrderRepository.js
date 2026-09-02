const BaseRepository = require('./BaseRepository');
const Order = require('../models/Order');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  // Order history, newest first: matches the { userId, createdAt } index
  async findByUser(userId, options = {}) {
    return this.findAll({ userId }, { sort: { createdAt: -1 }, ...options });
  }

  // Ownership-scoped fetch: returns null for a non-owner
  async findByIdForUser(orderId, userId, { isAdmin = false } = {}) {
    const filter = isAdmin ? { _id: orderId } : { _id: orderId, userId };
    return this.findOne(filter);
  }

  async updateStatus(orderId, orderStatus) {
    return this.updateById(orderId, { orderStatus });
  }

  // Update the payment status of an order
  async updatePaymentStatus(orderId, paymentStatus) {
    return this.updateById(orderId, { paymentStatus });
  }
}

module.exports = new OrderRepository();
module.exports.OrderRepository = OrderRepository;
