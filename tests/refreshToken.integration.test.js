// Refresh tokens are persisted, so a restart does not end every session.
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const RefreshToken = require('../src/models/RefreshToken');
const { refreshTokenRepository } = require('../src/repositories');
const { signRefreshToken, verifyRefreshToken } = require('../src/config/jwt');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Promise.all(mongoose.modelNames().map((n) => mongoose.model(n).syncIndexes()));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await RefreshToken.deleteMany({});
});

const credentials = {
  firstName: 'Rita',
  lastName: 'Refresh',
  email: 'rita.refresh@example.com',
  password: 'ritapass123',
};

const register = () => request(app).post('/api/auth/register').send(credentials);

describe('Refresh token persistence', () => {
  test('registering stores a refresh token row', async () => {
    const res = await register();

    expect(res.statusCode).toBe(201);
    expect(await RefreshToken.countDocuments()).toBe(1);
  });

  test('the raw token is never stored, only a hash', async () => {
    const res = await register();
    const row = await RefreshToken.findOne();

    expect(row.tokenHash).not.toBe(res.body.refreshToken);
    expect(row.tokenHash).toHaveLength(64);
    expect(row.tokenHash).toBe(RefreshToken.hash(res.body.refreshToken));
  });

  test('the row expiry matches the token exp claim', async () => {
    await register();
    const row = await RefreshToken.findOne();

    expect(row.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(row.revokedAt).toBeNull();
  });

  test('a token this process never issued is still accepted', async () => {
    // Record a token directly, as a previous server run would have left it
    await register();
    const user = await User.findOne({ email: credentials.email });

    const token = signRefreshToken({
      id: user.id,
      role: user.role,
      jti: 'issued-by-a-previous-process',
    });
    const { exp } = verifyRefreshToken(token);
    await refreshTokenRepository.issue(user.id, token, new Date(exp * 1000));

    const refreshed = await request(app).post('/api/auth/refresh').send({ refreshToken: token });

    expect(refreshed.statusCode).toBe(200);
    expect(refreshed.body.token).toBeTruthy();
  });
});

describe('Rotation and revocation', () => {
  test('refreshing rotates the token and revokes the old one', async () => {
    const res = await register();
    const original = res.body.refreshToken;

    const refreshed = await request(app).post('/api/auth/refresh').send({ refreshToken: original });

    expect(refreshed.statusCode).toBe(200);
    expect(refreshed.body.refreshToken).not.toBe(original);

    const oldRow = await RefreshToken.findOne({ tokenHash: RefreshToken.hash(original) });
    expect(oldRow.revokedAt).not.toBeNull();
  });

  test('a rotated token cannot be replayed', async () => {
    const res = await register();
    const original = res.body.refreshToken;

    await request(app).post('/api/auth/refresh').send({ refreshToken: original });
    const replay = await request(app).post('/api/auth/refresh').send({ refreshToken: original });

    expect(replay.statusCode).toBe(401);
  });

  test('logout revokes the token and blocks further refreshes', async () => {
    const res = await register();
    const { refreshToken } = res.body;

    const loggedOut = await request(app).post('/api/auth/logout').send({ refreshToken });
    expect(loggedOut.statusCode).toBe(200);

    const after = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(after.statusCode).toBe(401);
  });

  test('logging out with an unknown token still returns 200', async () => {
    const res = await request(app).post('/api/auth/logout').send({ refreshToken: 'not.a.token' });

    expect(res.statusCode).toBe(200);
  });

  test('a refresh with no token at all -> 401', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});

    expect(res.statusCode).toBe(401);
  });

  test('a signed but unrecorded token is rejected', async () => {
    // Valid signature, but absent from the allow-list
    const { signRefreshToken } = require('../src/config/jwt');
    const forged = signRefreshToken({ id: new mongoose.Types.ObjectId().toString(), role: 'admin' });

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: forged });

    expect(res.statusCode).toBe(401);
  });

  test('revokeAllForUser kills every session for that user', async () => {
    // Two sessions for one user: register, then log in again
    const first = await register();
    const second = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: credentials.password });

    expect(second.statusCode).toBe(200);
    expect(second.body.refreshToken).not.toBe(first.body.refreshToken);

    const user = await User.findOne({ email: credentials.email });
    const revoked = await refreshTokenRepository.revokeAllForUser(user.id);

    expect(revoked).toBe(2);
    expect(await refreshTokenRepository.isActive(first.body.refreshToken)).toBe(false);
    expect(await refreshTokenRepository.isActive(second.body.refreshToken)).toBe(false);
  });

  test('deleting the user invalidates the session on refresh', async () => {
    const res = await register();
    await User.deleteMany({});

    const after = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: res.body.refreshToken });

    expect(after.statusCode).toBe(401);
  });
});
