const rateLimit = require('express-rate-limit');

// Brute-force protection for the authentication endpoints
const ENABLED = process.env.NODE_ENV !== 'test';

const passThrough = (req, res, next) => next();

const limiter = (options) => (ENABLED ? rateLimit(options) : passThrough);

// Broad ceiling for everything under /api/auth
const authLimiter = limiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many attempts made from this IP. Try again later.',
  },
});

// Much tighter limit on login specifically, which is where password guessing happens
const loginLimiter = limiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    status: 'fail',
    message: 'Too many login attempts. Try again in 15 minutes.',
  },
});

module.exports = { authLimiter, loginLimiter };
