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

const {verifyAccessToken} = require('../utils/token');
const AppError = require('../utils/AppError');

function protect(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

    if (!token) {
        return next(new AppError('Not Logged In. Log In to gain access', 401));
    }

    try {const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        next(new AppError('Invalid or expired Token', 401));
    }
}

function restrictTo(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission for this action', 403));

        }
        next();
    }
}

module.exports = {
    protect,
    restrictTo
};
