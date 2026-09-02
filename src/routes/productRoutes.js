const express = require('express');
const productController = require('../controllers/productController');

// TODO (Person 2 — Login and Security): once middleware/auth.js exists,
//      re-import the guards and restore them on the write routes below:
//      const { protect, restrictTo } = require('../middleware/auth');
//      .post(protect, restrictTo('admin'), ...)
//      .put(protect, restrictTo('admin'), ...)
//      .delete(protect, restrictTo('admin'), ...)
//      Until then the admin-only product endpoints are UNPROTECTED.

const router = express.Router();

router
  .route('/')
  .get(productController.getAllProducts)
  .post(productController.createProduct); // admin-only once auth lands

router
  .route('/:id')
  .get(productController.getProduct)
  .put(productController.updateProduct) // admin-only once auth lands
  .delete(productController.deleteProduct); // admin-only once auth lands

module.exports = router;
