/**
 * PERSON 2 — Login and Security.
 *
 * Token and role checking middleware.
 *
 *   protect            verifies the Bearer token, loads the user onto
 *                      req.user, 401s on missing/invalid/expired tokens
 *   restrictTo(...roles)  403s when req.user.role is not in the list.
 *                      Must run after protect.
 *
 * Failures are forwarded with next(new AppError(...)) so they land in the
 * central error handler, which also translates raw JsonWebTokenError and
 * TokenExpiredError into 401s.
 */
const { verifyAccessToken } = require('../config/jwt');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { userRepository } = require('../repositories');

exports.protect = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(AppError.unauthorized('You are not logged in. Please log in to continue.'));
  }

  const token = authorization.split(' ')[1];

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    // JsonWebTokenError and TokenExpiredError are translated to 401 by
    // the central error handler.
    return next(err);
  }

  // The user might have been deleted after the token was issued.
  const user = await userRepository.findById(decoded.id);
  if (!user) {
    return next(AppError.unauthorized('The user belonging to this token no longer exists.'));
  }

  req.user = user;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Please log in to continue.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        AppError.forbidden('You do not have permission to perform this action.')
      );
    }

    next();
  };
