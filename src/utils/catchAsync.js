// Forwards a rejected promise to next(err), so controllers need no try/catch.
// The handler runs inside the chain rather than before it, so a handler that
// throws synchronously is caught too instead of escaping to Express. The chain
// is returned so callers can await it.
const catchAsync = (fn) => (req, res, next) =>
  Promise.resolve()
    .then(() => fn(req, res, next))
    .catch(next);

module.exports = catchAsync;
module.exports.catchAsync = catchAsync;
module.exports.asyncHandler = catchAsync;
