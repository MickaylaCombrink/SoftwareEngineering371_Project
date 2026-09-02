require('dotenv').config();

// Uncaught synchronous errors: log and exit, let the process manager restart
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION, Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const port = process.env.PORT || 5000;
let server;

// Connect first, then listen: fail fast if the database is unreachable
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

// Unhandled promise rejections: close the server, then exit
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION, Shutting down...');
  console.error(err.name, err.message);

  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Graceful shutdown on SIGTERM
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
