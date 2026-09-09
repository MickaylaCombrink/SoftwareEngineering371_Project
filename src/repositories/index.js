// Data access layer entry point
const BaseRepository = require('./BaseRepository');

const userRepository = require('./UserRepository');
const productRepository = require('./ProductRepository');
const categoryRepository = require('./CategoryRepository');
const cartRepository = require('./CartRepository');
const orderRepository = require('./OrderRepository');
const refreshTokenRepository = require('./RefreshTokenRepository');

module.exports = {
  BaseRepository,

  userRepository,
  productRepository,
  categoryRepository,
  cartRepository,
  orderRepository,
  refreshTokenRepository,

  UserRepository: userRepository.UserRepository,
  ProductRepository: productRepository.ProductRepository,
  CategoryRepository: categoryRepository.CategoryRepository,
  CartRepository: cartRepository.CartRepository,
  OrderRepository: orderRepository.OrderRepository,
  RefreshTokenRepository: refreshTokenRepository.RefreshTokenRepository,
};
