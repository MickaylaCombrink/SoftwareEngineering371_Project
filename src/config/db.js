const mongoose = require('mongoose');

/**
 * Singleton MongoDB connection.
 * System Plan > Design Patterns: "A single MongoDB connection instance
 * will be maintained to optimize resource usage."
 *
 * The connection promise is cached, so calling connectDB() from the
 * server, from a script or from a test all reuse the same connection
 * instead of opening a new pool each time.
 */
let connectionPromise = null;

function connectDB(uri = process.env.MONGO_URI || process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error('MONGO_URI or MONGODB_URI environment variable is not set');
  }

  if (!connectionPromise) {
    mongoose.set('strictQuery', true);

    connectionPromise = mongoose
      .connect(uri)
      .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      })
      .catch((err) => {
        connectionPromise = null; // allow a retry on the next call
        console.error('MongoDB connection error:', err.message);
        throw err;
      });
  }

  return connectionPromise;
}

async function disconnectDB() {
  await mongoose.connection.close();
  connectionPromise = null;
}

module.exports = { connectDB, disconnectDB };
