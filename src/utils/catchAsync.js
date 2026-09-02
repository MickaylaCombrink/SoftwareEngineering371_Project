// Forwards a rejected promise to next(err), so controllers need no try/catch
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
module.exports.catchAsync = catchAsync;
module.exports.asyncHandler = catchAsync;
