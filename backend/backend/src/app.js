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
app.use(cors());
app.use(express.json());

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
