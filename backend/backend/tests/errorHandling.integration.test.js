/**
 * Integration tests targeting error-handling behaviour specifically.
 * Run against an in-memory MongoDB (mongodb-memory-server), per the
 * plan's "Integration" test level.
 *
 * These map directly to the representative test cases in the project plan.
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany();
  await Product.deleteMany();
});

describe('Auth error handling', () => {
  const validUser = {
    firstName: 'James',
    lastName: 'Koedoe',
    email: 'jk@example.com',
    password: 'CorrectHorse1',
  };

  test('register with an email already in use -> 409, no second user created', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.statusCode).toBe(409);
    const count = await User.countDocuments({ email: validUser.email });
    expect(count).toBe(1);
  });

  test('register with a short password -> 400 with validation message', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'short1' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/password/i);
  });

  test('login with an incorrect password -> 401, generic message', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'wrongPassword1' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Incorrect email or password.');
  });

  test('login with an unknown email -> 401, same generic message (no enumeration)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever1' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Incorrect email or password.');
  });
});

describe('Product error handling', () => {
  test('getting a product with a malformed ID -> 400 via CastError handler', async () => {
    const res = await request(app).get('/api/products/not-a-valid-id');
    expect(res.statusCode).toBe(400);
  });

  test('getting a non-existent but valid ID -> 404', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/products/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });
});

describe('Unmatched route', () => {
  test('unknown route -> 404 via notFound middleware', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.statusCode).toBe(404);
  });
});
