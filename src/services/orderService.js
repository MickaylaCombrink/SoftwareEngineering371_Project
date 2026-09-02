/**
 * UNASSIGNED — Orders.
 *
 * Checkout: read the user's cart, verify stock, snapshot each line item's
 * price into the order, decrement stock, empty the cart.
 *
 * Consistency strategy — intended saga for the reasons below:
 *   1. Stock is decremented atomically per line via
 *      productRepository.decrementStock(), which refuses to oversell.
 *   2. If anything fails AFTER a decrement but BEFORE the order is
 *      committed, the decrement is rolled back (stock restored) so no
 *      product can be "lost" without an order to show for it.
 *   3. The cart is only emptied once the order exists.
 *
 * A Mongo multi-document transaction would give the same guarantee in
 * one step, but it requires a replica-set deployment (Atlas qualifies;
 * a local standalone mongod and the in-memory test server do not). The
 * saga keeps checkout identical — and verifiable by the test suite — in
 * every environment, rather than having a different code path on Atlas.
 *
 * Storing a `unitPrice` snapshot on each order line is what keeps a later
 * price change from altering historic orders (see the plan's test case).
 */
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

    // Verify stock up front so we fail fast with a clear 422 rather than
    // rolling anything back.
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
      // Snapshot of the unit price at purchase time.
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    }));

    const totalPrice = orderItems.reduce(
      (sum, o) => sum + o.unitPrice * o.quantity,
      0
    );

    // Record which lines we decremented, so the rollback loop below only
    // touches stocks that were actually reduced.
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
      // Undo any stock decrements so a failed checkout does not consume
      // inventory. Ignore errors here: the compensating write is best
      // effort, and the failure that triggered the catch is more important.
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
      // The caller may either not own it or it may not exist — respond with
      // 403 either way so we never leak whether an order id is valid.
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