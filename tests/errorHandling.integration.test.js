// Covers the centralised error handlers themselves — the translation of
// third-party error shapes into our own response envelope. Resource-specific
// behaviour (category CRUD, product validation) belongs to those suites and is
// deliberately not repeated here.
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const User = require('../src/models/User');

let mongoServer;
let adminToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Promise.all(mongoose.modelNames().map((n) => mongoose.model(n).syncIndexes()));

  // Registration never grants the admin role, so promote the account directly
  const adminCredentials = {
    email: 'mickayla.combrick@gmail.com',
    password: 'mickayla123',
  };
  await request(app).post('/api/auth/register').send({
    firstName: 'Mickayla',
    lastName: 'Combrick',
    ...adminCredentials,
  });
  await User.updateOne({ email: adminCredentials.email }, { role: 'admin' });
  const adminLogin = await request(app).post('/api/auth/login').send(adminCredentials);
  adminToken = adminLogin.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Product.deleteMany();
  await Category.deleteMany();
});

describe('handleCastErrorDB', () => {
  test('an unparseable ObjectId becomes a 400, not a 500', async () => {
    const res = await request(app).get('/api/products/not-a-valid-id');

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('fail');
  });
});

describe('handleValidationErrorDB', () => {
  test('a schema violation becomes a 400 naming the offending field', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ productName: 'Bad', description: 'd', price: -1, stock: 1 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/price/i);
  });
});

describe('handleDuplicateFieldsDB', () => {
  test('a unique-index collision becomes a 409 and writes nothing', async () => {
    const sample = { category: 'Floral', description: 'Flower notes.' };

    await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sample);

    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sample);

    expect(res.statusCode).toBe(409);
    expect(await Category.countDocuments()).toBe(1);
  });
});

describe('notFound middleware', () => {
  test('an unmatched route becomes a 404', async () => {
    const res = await request(app).get('/api/does-not-exist');

    expect(res.statusCode).toBe(404);
  });

  test('a mounted route rejecting bad input is not mistaken for a missing route', async () => {
    const login = await request(app).post('/api/auth/login').send({});
    expect(login.statusCode).toBe(400);

    const cart = await request(app).get('/api/cart');
    expect(cart.statusCode).toBe(401);
  });
});

describe('Health check', () => {
  test('GET /api/health -> 200', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
  });
});
