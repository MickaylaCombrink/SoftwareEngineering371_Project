const AppError = require('../utils/AppError');

// Catches any request that did not match a route
module.exports = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};
