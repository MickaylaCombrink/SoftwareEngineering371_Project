const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const notFound = require('./middleware/notFound');
const globalErrorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());

// Locked to the front-end origin when CLIENT_ORIGIN is set (production),
// open in development so the Vite dev server and API clients just work.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    credentials: true,
  })
);

app.use(express.json());

// --- Rate limiting (brute-force protection) ---
// A stricter limit applies to the authentication endpoints where repeated
// guesses are the attack of interest (login, register, refresh).
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests allowed before a 429
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'fail', message: 'Too many requests, please try again later.' },
  })
);

// --- Health check (used by the host's uptime probe) ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running.' });
});

// --- API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// --- Error handling (order matters: these must be LAST) ---
// 1) Anything that reaches here didn't match a route above -> 404
app.use(notFound);
// 2) Anything passed to next(err) anywhere in the app ends up here
app.use(globalErrorHandler);

module.exports = app;
