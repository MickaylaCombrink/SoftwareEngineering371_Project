const AppError = require('../utils/AppError');

/**
 * ---------------------------------------------------------------------
 * Error transformers
 * Convert known third-party error shapes (Mongoose, JWT) into our own
 * AppError so the response format is always consistent, regardless of
 * where the error originated.
 * ---------------------------------------------------------------------
 */

// Invalid ObjectId in a route param, e.g. GET /api/products/not-a-valid-id
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Duplicate unique index, e.g. registering with an email already in use
// -> satisfies the "Register with an email already in use -> 409" test case
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0];
  const value = err.keyValue ? err.keyValue[field] : '';
  const message = field
    ? `An account with that ${field} (${value}) already exists.`
    : 'Duplicate field value.';
  return new AppError(message, 409);
};

// Mongoose schema validation failures (e.g. password too short)
// -> satisfies the "Register with a 6-character password -> 400" test case
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid authentication token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401);

/**
 * ---------------------------------------------------------------------
 * Environment-specific response formatters
 * ---------------------------------------------------------------------
 */

const sendErrorDev = (err, res) => {
  // Verbose response for local/staging debugging: include stack trace
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // Trusted, predictable error: safe to expose the message
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Unknown/programming error: never leak internals to the client
    // eslint-disable-next-line no-console
    console.error('UNEXPECTED ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    });
  }
};

/**
 * globalErrorHandler
 * Express recognizes this as error-handling middleware because it
 * declares 4 parameters (err, req, res, next). Must be registered
 * LAST in app.js, after notFound and all routes.
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
    return;
  }

  // Work on a copy so we don't mutate the original error object
  let error = Object.assign(
    Object.create(Object.getPrototypeOf(err)),
    err
  );
  error.message = err.message;

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  sendErrorProd(error, res);
};
