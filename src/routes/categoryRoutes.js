const express = require('express');
const categoryController = require('../controllers/categoryController');

// TODO (Person 2 — Login and Security): once middleware/auth.js exists,
//      re-import the guards and restore them on the write routes below:
//      const { protect, restrictTo } = require('../middleware/auth');
//      .post(protect, restrictTo('admin'), ...)
//      .put(protect, restrictTo('admin'), ...)
//      .delete(protect, restrictTo('admin'), ...)
//      Until then the admin-only category endpoints are UNPROTECTED.

const router = express.Router();

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(categoryController.createCategory); // admin-only once auth lands

router
  .route('/:id')
  .get(categoryController.getCategory)
  .put(categoryController.updateCategory) // admin-only once auth lands
  .delete(categoryController.deleteCategory); // admin-only once auth lands

module.exports = router;
