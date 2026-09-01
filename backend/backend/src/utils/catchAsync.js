/**
 * catchAsync
 * Wraps an async controller/middleware function so that any rejected
 * promise (thrown error) is forwarded to Express's error-handling
 * middleware via next(err), instead of crashing the process or
 * requiring a try/catch in every controller.
 *
 * Usage:
 *   exports.getProduct = catchAsync(async (req, res, next) => { ... });
 */
module.exports = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
