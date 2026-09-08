const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const User = require('../src/models/User');

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
});

const validUser = {
  firstName: 'James',
  lastName: 'Koedoe',
  email: 'jk@example.com',
  password: 'strongpass123',
};

async function register(overrides = {}) {
  return request(app).post('/api/auth/register').send({ ...validUser, ...overrides });
}

async function login(email = validUser.email, password = validUser.password) {
  return request(app).post('/api/auth/login').send({ email, password });
}

describe('Authentication', () => {
  test('register with a valid body -> 201 and a token', async () => {
    const res = await register();
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.password).toBeUndefined();
  });

  test('register with an email already in use -> 409, no second user created', async () => {
    await register();
    const res = await register();
    expect(res.statusCode).toBe(409);
    expect(await User.countDocuments()).toBe(1);
  });

  test('register with a 6-character password -> 400 with a validation message', async () => {
    const res = await register({ password: 'sixchr' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/password/i);
  });

  test('login with correct credentials -> 200 and a token', async () => {
    await register();
    const res = await login();
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  test('login with an incorrect password -> 401', async () => {
    await register();
    const res = await login(validUser.email, 'wrongpass1');
    expect(res.statusCode).toBe(401);
  });

  test('login with an unknown email -> 401 with the same message (no enumeration)', async () => {
    await register();
    const wrongPw = await login(validUser.email, 'wrongpass1');
    const wrongEmail = await login('nobody@example.com', validUser.password);
    expect(wrongPw.statusCode).toBe(401);
    expect(wrongEmail.statusCode).toBe(401);
    expect(wrongPw.body.message).toBe(wrongEmail.body.message);
  });

  test('the stored password is a hash, never the plain text', async () => {
    await register();
    const user = await User.findOne({ email: validUser.email }).select('+password');
    expect(user.password).not.toBe(validUser.password);
    expect(user.password.startsWith('$2')).toBe(true); // bcrypt hash
    expect(await bcrypt.compare(validUser.password, user.password)).toBe(true);
  });

  test('GET /me without a token -> 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  test('GET /me with an expired token -> 401', async () => {
    // Mint a token that is already expired by signing with a tiny lifespan
    const jwt = require('jsonwebtoken');
    const expired = jwt.sign({ id: new mongoose.Types.ObjectId().toString() }, process.env.JWT_SECRET, {
      expiresIn: -10,
    });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expired}`);
    expect(res.statusCode).toBe(401);
  });

  test('refresh with a valid refresh token -> a new access token', async () => {
    const reg = await register();
    const refreshToken = reg.body.refreshToken;
    expect(refreshToken).toBeTruthy();

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  test('logout invalidates the refresh token', async () => {
    const reg = await register();
    const refreshToken = reg.body.refreshToken;

    await request(app).post('/api/auth/logout').send({ refreshToken });

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.statusCode).toBe(401);
  });

  test('a customer calling an admin-only route -> 403 via restrictTo', async () => {
    const reg = await register();
    const token = reg.body.token;

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ productName: 'X', description: 'd', price: 10, stock: 1 });

    expect(res.statusCode).toBe(403);
  });
});

describe('Change password', () => {
  function changePassword(token, body) {
    return request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  }

  test('without a token -> 401', async () => {
    const res = await request(app)
      .put('/api/auth/change-password')
      .send({ currentPassword: 'strongpass123', newPassword: 'brandnewpass123' });
    expect(res.statusCode).toBe(401);
  });

  test('with the wrong current password -> 401', async () => {
    const reg = await register();
    const res = await changePassword(reg.body.token, {
      currentPassword: 'totallywrong',
      newPassword: 'brandnewpass123',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/current password/i);
  });

  test('with a too-short new password -> 400', async () => {
    const reg = await register();
    const res = await changePassword(reg.body.token, {
      currentPassword: validUser.password,
      newPassword: 'short',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/password/i);
  });

  test('happy path: old password stops working, new one logs in', async () => {
    const reg = await register();

    const res = await changePassword(reg.body.token, {
      currentPassword: validUser.password,
      newPassword: 'brandnewpass123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/updated/i);

    const oldLogin = await login(validUser.email, validUser.password);
    expect(oldLogin.statusCode).toBe(401);

    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'brandnewpass123' });
    expect(newLogin.statusCode).toBe(200);
    expect(newLogin.body.token).toBeTruthy();
  });

  test('changing the password revokes the user refresh tokens', async () => {
    const reg = await register();
    const refreshToken = reg.body.refreshToken;

    await changePassword(reg.body.token, {
      currentPassword: validUser.password,
      newPassword: 'brandnewpass123',
    });

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.statusCode).toBe(401);
  });
});
