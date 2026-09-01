const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(protect, restrictTo('admin'), categoryController.createCategory);

router
  .route('/:id')
  .get(categoryController.getCategory)
  .put(protect, restrictTo('admin'), categoryController.updateCategory)
  .delete(protect, restrictTo('admin'), categoryController.deleteCategory);

module.exports = router;
