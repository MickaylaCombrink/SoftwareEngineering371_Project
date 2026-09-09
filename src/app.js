const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const notFound = require('./middleware/notFound');
const globalErrorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());

// CORS. CLIENT_ORIGIN accepts a comma-separated list, so a deployed site and
// a preview URL can both be allowed without reopening the API to everyone
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Outside development an unset CLIENT_ORIGIN is a deployment mistake, not a
// reason to fall back to '*' and accept requests from any site
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('CLIENT_ORIGIN must be set when NODE_ENV=production.');
}

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header: same-origin, curl, Postman, server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.length === 0) return callback(null, true); // development
      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true,
  })
);

app.use(express.json());

// Auth rate limiting is applied in authRoutes

// Health check (used by the host's uptime probe)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running.' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Error handling must stay last
app.use(notFound);
app.use(globalErrorHandler);

module.exports = app;
