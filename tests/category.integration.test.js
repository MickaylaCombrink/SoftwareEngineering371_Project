// Categories API: read routes are public, writes are admin-only and go
// through the repository layer with a field whitelist.
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Category = require('../src/models/Category');
const User = require('../src/models/User');

let mongoServer;
let adminToken;
let customerToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Promise.all(mongoose.modelNames().map((n) => mongoose.model(n).syncIndexes()));

  const customer = await request(app).post('/api/auth/register').send({
    firstName: 'Cam',
    lastName: 'Customer',
    email: 'cam.customer@example.com',
    password: 'campass123',
  });
  customerToken = customer.body.token;

  // Registration never grants the admin role, so promote the account directly
  const adminCredentials = { email: 'cat.admin@example.com', password: 'catpass123' };
  await request(app)
    .post('/api/auth/register')
    .send({ firstName: 'Cat', lastName: 'Admin', ...adminCredentials });
  await User.updateOne({ email: adminCredentials.email }, { role: 'admin' });
  const login = await request(app).post('/api/auth/login').send(adminCredentials);
  adminToken = login.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Category.deleteMany({});
  await Category.create([
    { category: 'Zebra print', description: 'Striped things.' },
    { category: 'Alpaca wool', description: 'Warm things.' },
  ]);
});

const asAdmin = (method, url) =>
  request(app)[method](url).set('Authorization', `Bearer ${adminToken}`);

describe('Reading categories', () => {
  test('lists categories alphabetically', async () => {
    const res = await request(app).get('/api/categories');

    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(2);
    expect(res.body.data.categories.map((c) => c.category)).toEqual([
      'Alpaca wool',
      'Zebra print',
    ]);
  });

  test('fetches one category', async () => {
    const existing = await Category.findOne({ category: 'Alpaca wool' });
    const res = await request(app).get(`/api/categories/${existing._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.category.description).toBe('Warm things.');
  });

  test('a malformed id -> 400', async () => {
    expect((await request(app).get('/api/categories/not-an-id')).statusCode).toBe(400);
  });

  test('a valid but unknown id -> 404', async () => {
    const res = await request(app).get(`/api/categories/${new mongoose.Types.ObjectId()}`);
    expect(res.statusCode).toBe(404);
  });
});

describe('Category writes are admin-only', () => {
  const body = { category: 'New', description: 'd' };

  test('creating without a token -> 401', async () => {
    expect((await request(app).post('/api/categories').send(body)).statusCode).toBe(401);
  });

  test('creating as a customer -> 403', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(body);

    expect(res.statusCode).toBe(403);
    expect(await Category.countDocuments()).toBe(2);
  });
});

describe('Admin category management', () => {
  test('creates a category -> 201', async () => {
    const res = await asAdmin('post', '/api/categories').send({
      category: 'Beanies',
      description: 'Head things.',
    });

    expect(res.statusCode).toBe(201);
    expect(await Category.countDocuments()).toBe(3);
  });

  test('ignores fields a client is not allowed to set', async () => {
    const forgedId = new mongoose.Types.ObjectId();
    const res = await asAdmin('post', '/api/categories').send({
      category: 'Sneaky',
      description: 'd',
      _id: forgedId,
      injected: 'nope',
    });

    expect(res.statusCode).toBe(201);
    const saved = await Category.findOne({ category: 'Sneaky' }).lean();
    expect(saved.injected).toBeUndefined();
    expect(saved._id.toString()).not.toBe(forgedId.toString());
  });

  test('a duplicate name -> 409 and nothing is created', async () => {
    const res = await asAdmin('post', '/api/categories').send({
      category: 'Zebra print',
      description: 'Duplicate.',
    });

    expect(res.statusCode).toBe(409);
    expect(await Category.countDocuments()).toBe(2);
  });

  test('a missing description -> 400', async () => {
    const res = await asAdmin('post', '/api/categories').send({ category: 'Orphan' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/description/i);
  });

  test('updates a category -> 200', async () => {
    const existing = await Category.findOne({ category: 'Zebra print' });
    const res = await asAdmin('put', `/api/categories/${existing._id}`).send({
      description: 'Updated.',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.category.description).toBe('Updated.');
  });

  test('an update with no usable fields -> 400', async () => {
    const existing = await Category.findOne({ category: 'Zebra print' });
    const res = await asAdmin('put', `/api/categories/${existing._id}`).send({ nonsense: true });

    expect(res.statusCode).toBe(400);
  });

  test('updating an unknown id -> 404', async () => {
    const res = await asAdmin('put', `/api/categories/${new mongoose.Types.ObjectId()}`).send({
      description: 'x',
    });

    expect(res.statusCode).toBe(404);
  });

  test('deletes a category -> 204', async () => {
    const existing = await Category.findOne({ category: 'Zebra print' });
    const res = await asAdmin('delete', `/api/categories/${existing._id}`);

    expect(res.statusCode).toBe(204);
    expect(await Category.countDocuments()).toBe(1);
  });

  test('deleting an unknown id -> 404', async () => {
    const res = await asAdmin('delete', `/api/categories/${new mongoose.Types.ObjectId()}`);

    expect(res.statusCode).toBe(404);
  });
});
