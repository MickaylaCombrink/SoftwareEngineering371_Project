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

// CORS: locked to CLIENT_ORIGIN in production, open in development
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
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
