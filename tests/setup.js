/**
 * Jest setup — runs before every test file executes.
 *
 * Sets the environment variables the app reads at module-load time so
 * it works against the in-memory MongoDB without a real .env file.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-access-secret-at-least-32-bytes-long!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-bytes-long!!';
process.env.JWT_EXPIRES_IN = '1d';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
