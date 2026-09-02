/**
 * PERSON 2 — Login and Security.  NOT IMPLEMENTED.
 *
 * Token and role checking middleware.
 *
 * Expected exports — these exact names are referenced by the TODOs in
 * src/routes/productRoutes.js and src/routes/categoryRoutes.js:
 *
 *   protect            verifies the Bearer token, loads the user onto
 *                      req.user, 401s on missing/invalid/expired tokens
 *   restrictTo(...roles)  403s when req.user.role is not in the list.
 *                      Must run after protect.
 *
 * Forward failures with next(new AppError(msg, 401)) so they land in the
 * central error handler (src/middleware/errorHandler.js), which already
 * translates JsonWebTokenError and TokenExpiredError into 401s.
 */

module.exports = {};
