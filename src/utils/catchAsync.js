/**
 * Wraps an async Express route/controller so any rejected promise is
 * forwarded to next(err) instead of needing a try/catch in every
 * controller. Keeps controllers thin (Controllers layer: "HTTP
 * concerns" only, per the System Plan architecture diagram).
 *
 * Exported as both `catchAsync` (the name used across the controllers)
 * and `asyncHandler` (the name used in the System Plan), so either
 * import style resolves to the same function.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
module.exports.catchAsync = catchAsync;
module.exports.asyncHandler = catchAsync;
