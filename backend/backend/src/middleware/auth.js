const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');

/**
 * protect
 * Verifies the JWT on incoming requests. Any failure (missing token,
 * malformed token, expired token, deleted user) is forwarded to the
 * global error handler as a 401 AppError rather than throwing raw
 * jsonwebtoken errors — those are also caught by errorHandler.js as
 * a safety net, but we produce clean messages here first.
 */
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to continue.', 401)
    );
  }

  // Throws JsonWebTokenError / TokenExpiredError on failure —
  // caught by catchAsync and handled centrally in errorHandler.js
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  req.user = currentUser;
  next();
});

/**
 * restrictTo
 * Role-based authorization guard, e.g. restrictTo('admin').
 * Must run after `protect` so req.user is populated.
 * -> satisfies "Request another user's order by id -> 403" style checks
 *    at the route level for admin-only endpoints.
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};
