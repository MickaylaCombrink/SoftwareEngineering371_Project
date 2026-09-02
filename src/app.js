const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// TODO (Person 2 — Login and Security): create src/routes/authRoutes.js
//      and uncomment the mount below.
const authRoutes = require('./routes/authRoutes');

// TODO (Person 3 — Shopping Cart API): create src/routes/cartRoutes.js
//      and uncomment the mount below.
// const cartRoutes = require('./routes/cartRoutes');

// TODO (unassigned — Orders): the orders endpoints depend on both the auth
//      middleware (Person 2) and the cart (Person 3), so they are not built
//      yet. Whoever picks this up adds src/routes/orderRoutes.js here.
// const orderRoutes = require('./routes/orderRoutes');

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

// TODO (Person 2): add rate limiting here (express-rate-limit), especially
//      on the login route, before the routes are mounted.

// --- Health check (used by the host's uptime probe) ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running.' });
});

// --- API routes ---
// app.use('/api/auth', authRoutes);      // Person 2
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
// app.use('/api/cart', cartRoutes);      // Person 3
// app.use('/api/orders', orderRoutes);   // unassigned

// --- Error handling (order matters: these must be LAST) ---
// 1) Anything that reaches here didn't match a route above -> 404
app.use(notFound);
// 2) Anything passed to next(err) anywhere in the app ends up here
app.use(globalErrorHandler);

module.exports = app;
