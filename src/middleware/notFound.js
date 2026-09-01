const AppError = require('../utils/AppError');

/**
 * notFound
 * Catches any request that didn't match a defined route
 * (e.g. GET /api/nonexistent) and forwards a 404 AppError
 * to the global error handler, instead of Express's default
 * HTML error page.
 *
 * Must be registered AFTER all route handlers in app.js.
 */
module.exports = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};
