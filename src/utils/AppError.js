/**
 * App Error
 * Represents a predictable, "operational" error (bad input, not found,
 * duplicate resource, forbidden, etc.) as opposed to a programming bug.
 * Controllers throw/next() these; the global error handler knows how
 * to translate them into a clean JSON response.
 *
 * Both styles work and are equivalent:
 *   next(new AppError('No product found with that ID.', 404))
 *   next(AppError.notFound('No product found with that ID.'))
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // flags this as a known/expected error

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request') {
    return new AppError(message, 400);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }

  static conflict(message = 'Conflict') {
    return new AppError(message, 409);
  }

  static unprocessable(message = 'Unprocessable entity') {
    return new AppError(message, 422);
  }
}

module.exports = AppError;
