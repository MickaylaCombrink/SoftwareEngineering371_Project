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
    // JWT errors are translated to 401 by the central error handler
    return next(err);
  }

  // Re-read the user rather than trusting the payload: the account may have been deleted or demoted
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
