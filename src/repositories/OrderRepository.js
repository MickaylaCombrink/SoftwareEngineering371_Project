const BaseRepository = require('./BaseRepository');
const Order = require('../models/Order');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  /**
   * A user's order history, newest first — the read this API does most
   * often, and the reason for the { userId, createdAt } compound index.
   */
  async findByUser(userId, options = {}) {
    return this.findAll({ userId }, { sort: { createdAt: -1 }, ...options });
  }

  /**
   * Scoped fetch used by GET /api/orders/:id. Returning null for an
   * order the user doesn't own keeps ownership logic out of the
   * controller and guarantees no order fields are ever serialized for
   * a non-owner. Admins bypass the scope.
   */
  async findByIdForUser(orderId, userId, { isAdmin = false } = {}) {
    const filter = isAdmin ? { _id: orderId } : { _id: orderId, userId };
    return this.findOne(filter);
  }

  /** Admin: update the fulfilment status of an order. */
  async updateStatus(orderId, orderStatus) {
    return this.updateById(orderId, { orderStatus });
  }

  /** Update the payment status of an order. */
  async updatePaymentStatus(orderId, paymentStatus) {
    return this.updateById(orderId, { paymentStatus });
  }
}

module.exports = new OrderRepository();
module.exports.OrderRepository = OrderRepository;
