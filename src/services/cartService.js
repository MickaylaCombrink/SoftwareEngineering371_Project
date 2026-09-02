const AppError = require('../utils/AppError');
const { cartRepository, productRepository } = require('../repositories');

class CartService {
  async getCart(userId) {
    const cart = await cartRepository.findOrCreateByUser(userId);
    return this._withTotals(cart);
  }

  async addItem(userId, { productId, quantity = 1 }) {
    const quantityNum = Number(quantity);
    if (!Number.isInteger(quantityNum) || quantityNum < 1) {
      throw AppError.badRequest('Quantity must be a positive integer.');
    }

    const product = await productRepository.findById(productId);
    if (!product) {
      throw AppError.notFound('No product found with that ID.');
    }

    // Account for what is already in the cart, or adding more could oversell
    const cart = await cartRepository.findOrCreateByUser(userId);
    const existing = cart.items.find(
      (i) => i.productId.toString() === productId.toString()
    );

    const alreadyInCart = existing ? existing.quantity : 0;
    const requestedTotal = alreadyInCart + quantityNum;

    if (requestedTotal > product.stock) {
      throw AppError.unprocessable(
        `Only ${product.stock} unit(s) of "${product.productName}" are available.`
      );
    }

    if (existing) {
      existing.quantity = requestedTotal;
    } else {
      cart.items.push({
        productId,
        name: product.productName,
        unitPrice: product.price,
        quantity: quantityNum,
      });
    }

    await cart.save();

    return this._withTotals(cart);
  }

  async changeQuantity(userId, productId, { quantity }) {
    const quantityNum = Number(quantity);
    if (!Number.isInteger(quantityNum) || quantityNum < 1) {
      throw AppError.badRequest('Quantity must be a positive integer.');
    }

    const cart = await cartRepository.findOrCreateByUser(userId);
    const existing = cart.items.find(
      (i) => i.productId.toString() === productId.toString()
    );

    if (!existing) {
      throw AppError.notFound('That item is not in your cart.');
    }

    // Bound by the live product stock
    const product = await productRepository.findById(productId);
    if (!product) {
      throw AppError.notFound('No product found with that ID.');
    }
    if (quantityNum > product.stock) {
      throw AppError.unprocessable(
        `Only ${product.stock} unit(s) of "${product.productName}" are available.`
      );
    }

    existing.quantity = quantityNum;
    await cart.save();

    return this._withTotals(cart);
  }

  async removeItem(userId, productId) {
    const cart = await cartRepository.findOrCreateByUser(userId);
    const before = cart.items.length;
    cart.items = cart.items.filter(
      (i) => i.productId.toString() !== productId.toString()
    );

    if (cart.items.length === before) {
      throw AppError.notFound('That item is not in your cart.');
    }

    await cart.save();
    return this._withTotals(cart);
  }

  // Totals are recomputed on every read
  _withTotals(cart) {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    return { cart, subtotal, itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0) };
  }
}

module.exports = new CartService();
module.exports.CartService = CartService;
