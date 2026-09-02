/**
 * Integration tests for the central error handler and the Categories API
 * (Person 4 — Error Handling and Categories).
 *
 * Run against an in-memory MongoDB (mongodb-memory-server), per the
 * plan's "Integration" test level.
 *
 * NOTE: the auth error cases (409 on duplicate registration, 400 on a short
 * password, 401 on bad credentials) belong to Person 2 and live with the
 * auth work — they are not in this file because /api/auth does not exist yet.
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  // Build the declared indexes so the unique-constraint test is meaningful.
  await Promise.all(mongoose.modelNames().map((n) => mongoose.model(n).syncIndexes()));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Product.deleteMany();
  await Category.deleteMany();
});

describe('Product error handling', () => {
  test('getting a product with a malformed ID -> 400 via CastError handler', async () => {
    const res = await request(app).get('/api/products/not-a-valid-id');
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  test('getting a non-existent but valid ID -> 404', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/products/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });

  test('creating a product with a negative price -> 400 with validation message', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ productName: 'Bad', description: 'd', price: -1, stock: 1 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/price/i);
  });
});

describe('Categories API', () => {
  const sample = { category: 'Laptops', description: 'Portable computers.' };

  test('create then list -> 201 then the category comes back', async () => {
    const created = await request(app).post('/api/categories').send(sample);
    expect(created.statusCode).toBe(201);

    const list = await request(app).get('/api/categories');
    expect(list.statusCode).toBe(200);
    expect(list.body.results).toBe(1);
    expect(list.body.data.categories[0].category).toBe('Laptops');
  });

  test('duplicate category name -> 409 via the duplicate-key handler', async () => {
    await request(app).post('/api/categories').send(sample);

    const res = await request(app).post('/api/categories').send(sample);

    expect(res.statusCode).toBe(409);
    expect(await Category.countDocuments()).toBe(1);
  });

  test('missing required description -> 400', async () => {
    const res = await request(app).post('/api/categories').send({ category: 'Orphan' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/description/i);
  });

  test('update a category -> 200 with the new values', async () => {
    const created = await request(app).post('/api/categories').send(sample);

    const res = await request(app)
      .put(`/api/categories/${created.body.data.category._id}`)
      .send({ description: 'Updated description.' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.category.description).toBe('Updated description.');
  });

  test('delete a category -> 204, and it is gone', async () => {
    const created = await request(app).post('/api/categories').send(sample);

    const res = await request(app).delete(`/api/categories/${created.body.data.category._id}`);

    expect(res.statusCode).toBe(204);
    expect(await Category.countDocuments()).toBe(0);
  });

  test('deleting a category that does not exist -> 404', async () => {
    const res = await request(app).delete(`/api/categories/${new mongoose.Types.ObjectId()}`);
    expect(res.statusCode).toBe(404);
  });
});

describe('Unmatched route', () => {
  test('unknown route -> 404 via notFound middleware', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.statusCode).toBe(404);
  });

  test('a route belonging to work not built yet is also a 404', async () => {
    // /api/auth (Person 2) and /api/cart (Person 3) are not mounted yet.
    expect((await request(app).post('/api/auth/login')).statusCode).toBe(404);
    expect((await request(app).get('/api/cart')).statusCode).toBe(404);
  });
});

describe('Health check', () => {
  test('GET /api/health -> 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
  });
});
