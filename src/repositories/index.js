/**
 * Data access layer entry point.
 *
 * Each repository is exported as a ready-to-use singleton, so a
 * controller only needs:
 *
 *   const { productRepository } = require('../repositories');
 *   const products = await productRepository.search(req.query);
 *
 * The classes are exported alongside them for tests that want a fresh
 * instance or a stubbed model.
 */
const BaseRepository = require('./BaseRepository');

const userRepository = require('./UserRepository');
const productRepository = require('./ProductRepository');
const categoryRepository = require('./CategoryRepository');
const cartRepository = require('./CartRepository');
const orderRepository = require('./OrderRepository');

module.exports = {
  BaseRepository,

  userRepository,
  productRepository,
  categoryRepository,
  cartRepository,
  orderRepository,

  UserRepository: userRepository.UserRepository,
  ProductRepository: productRepository.ProductRepository,
  CategoryRepository: categoryRepository.CategoryRepository,
  CartRepository: cartRepository.CartRepository,
  OrderRepository: orderRepository.OrderRepository,
};
