/**
 * App Error
 * Represents a predictable, "operational" error (bad input, not found,
 * duplicate resource, forbidden, etc.) as opposed to a programming bug.
 * Controllers throw/next() these; the global error handler knows how
 * to translate them into a clean JSON response.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // flags this as a known/expected error

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
