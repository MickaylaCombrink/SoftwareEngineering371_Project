const express = require('express');
const queryController = require('../controllers/queryController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Any visitor can submit a contact query
router.post('/', queryController.createQuery);

// Everything below requires an admin session
router.use(protect, restrictTo('admin'));

router
  .route('/')
  .get(queryController.getAllQueries);

router
  .route('/:id')
  .get(queryController.getQuery)
  .put(queryController.updateQuery)
  .delete(queryController.deleteQuery);

module.exports = router;