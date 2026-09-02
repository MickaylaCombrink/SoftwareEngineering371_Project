const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15* 60 *1000, //15 minutes for attempts
    max: 50,    //50 requests
    standardHeaders: true, 
    legacyHeaders: false,
    message: {
        status: 'fail',
        message: 'Too many attempts made from this IP. Try again later.'
    },
    });

    const loginLimiter = rateLimit({
    windowMs: 15* 60 *1000, //15 minutes for attempts
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        status: 'fail',
        message: 'Too many login attempts. Try again in 15 minutes'
    },
    });

    module.exports = {authLimiter, loginLimiter};