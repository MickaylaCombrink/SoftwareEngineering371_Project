const AppError = require('../utils/AppError');
const {
  cartRepository,
  productRepository,
  orderRepository,
} = require('../repositories');

class OrderService {
  async checkout(userId) {
    const cart = await cartRepository.findOrCreateByUser(userId);

    if (cart.items.length === 0) {
      throw AppError.badRequest('Your cart is empty. Add items before checking out.');
    }

    // Verify stock up front so a shortage fails before anything is written
    for (const item of cart.items) {
      const product = await productRepository.findById(item.productId);
      if (!product) {
        throw AppError.badRequest(
          'One of your items is no longer available. Please remove it and try again.'
        );
      }
      if (item.quantity > product.stock) {
        throw AppError.unprocessable(
          `Only ${product.stock} unit(s) of "${product.productName}" are available.`
        );
      }
    }

    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      // Price snapshot, so later price changes never alter this order
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    }));

    const totalPrice = orderItems.reduce(
      (sum, o) => sum + o.unitPrice * o.quantity,
      0
    );

    // Track decremented lines so the rollback only restores those
    const decremented = [];

    try {
      for (const o of orderItems) {
        const updated = await productRepository.decrementStock(
          o.productId,
          o.quantity
        );
        if (!updated) {
          throw AppError.unprocessable(`Insufficient stock for "${o.name}".`);
        }
        decremented.push(o);
      }

      const order = await orderRepository.create({
        userId,
        items: orderItems,
        totalPrice,
      });

      await cartRepository.clear(userId);

      return order;
    } catch (err) {
      // Undo stock decrements: best effort, the original error matters more
      await Promise.all(
        decremented.map((o) =>
          productRepository
            .incrementStock(o.productId, o.quantity)
            .catch(() => {})
        )
      );
      throw err;
    }
  }

  async getMyOrders(userId) {
    return orderRepository.findByUser(userId);
  }

  async getOrder(orderId, userId, { isAdmin = false } = {}) {
    const order = await orderRepository.findByIdForUser(orderId, userId, { isAdmin });
    if (!order) {
      if (isAdmin) {
        throw AppError.notFound('No order found with that ID.');
      }
      // 403 whether or not it exists, so order ids are never leaked
      throw AppError.forbidden('You do not have permission to view this order.');
    }
    return order;
  }

  async updateStatus(orderId, orderStatus, { isAdmin = false }) {
    if (!isAdmin) {
      throw AppError.forbidden('Only administrators can update order status.');
    }
    const order = await orderRepository.updateStatus(orderId, orderStatus);
    if (!order) {
      throw AppError.notFound('No order found with that ID.');
    }
    return order;
  }
}

module.exports = new OrderService();
module.exports.OrderService = OrderService;
