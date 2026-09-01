const mongoose = require('mongoose');
require('dotenv').config();

// -----------------------------------------------------------------------
// Uncaught synchronous errors (e.g. reading an undefined property in a
// callback outside Express's request cycle). Must be registered BEFORE
// anything else runs, since it can happen at any time. There is no
// request/response to recover here, so we log and exit; a process
// manager (PM2 / Render / Docker) should restart the process.
// -----------------------------------------------------------------------
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

const DB = process.env.MONGO_URI;

mongoose
  .connect(DB)
  .then(() => console.log('MongoDB connection successful.'))
  .catch((err) => {
    // If the database can't be reached at boot, fail fast and loudly
    // rather than letting the API start and error on every request.
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port} (${process.env.NODE_ENV})`);
});

// -----------------------------------------------------------------------
// Unhandled promise rejections (e.g. a DB call that rejects outside any
// try/catch or catchAsync wrapper, such as during startup). We close the
// HTTP server gracefully — letting in-flight requests finish — before
// exiting, rather than killing the process instantly.
// -----------------------------------------------------------------------
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown on deploy/restart (e.g. Render sending SIGTERM)
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});

module.exports = server;
