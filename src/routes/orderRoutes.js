/**
 * UNASSIGNED — Orders.  NOT IMPLEMENTED.
 *
 * Suggested route table (all behind Person 2's `protect`):
 *   POST /            checkout
 *   GET  /            my orders
 *   GET  /:id         one order, owner or admin only
 *   PUT  /:id/status  admin only (restrictTo('admin'))
 *
 * Once the handlers exist, uncomment the /api/orders mount in src/app.js.
 */
const express = require('express');

const router = express.Router();

// TODO: router.use(protect); then the routes above.

module.exports = router;
