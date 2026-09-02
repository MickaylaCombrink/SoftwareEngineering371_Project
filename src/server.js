require('dotenv').config();

// -----------------------------------------------------------------------
// Uncaught synchronous errors (e.g. reading an undefined property in a
// callback outside Express's request cycle). Must be registered BEFORE
// anything else runs, since it can happen at any time. There is no
// request/response to recover here, so we log and exit; a process
// manager (PM2 / Render / Docker) should restart the process.
// -----------------------------------------------------------------------
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION, Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const port = process.env.PORT || 5000;
let server;

// Connect first, then listen: if the database can't be reached at boot we
// fail fast and loudly rather than starting the API and erroring on every
// request. connectDB caches the connection, so anything else that calls it
// later reuses this same one.
connectDB()
  .then(() => {
    server = app.listen(port, () => {
      console.log(`Server running on port ${port} (${process.env.NODE_ENV})`);
    });
  })
  .catch((err) => {
    console.error('Startup aborted:', err.message);
    process.exit(1);
  });

// -----------------------------------------------------------------------
// Unhandled promise rejections (e.g. a DB call that rejects outside any
// try/catch or catchAsync wrapper). We close the HTTP server gracefully —
// letting in-flight requests finish — before exiting, rather than killing
// the process instantly.
// -----------------------------------------------------------------------
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION, Shutting down...');
  console.error(err.name, err.message);

  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Graceful shutdown on deploy/restart (e.g. Render sending SIGTERM)
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');

  const finish = async () => {
    await disconnectDB();
    console.log('Process terminated.');
  };

  if (server) {
    server.close(finish);
  } else {
    finish();
  }
});

module.exports = app;
