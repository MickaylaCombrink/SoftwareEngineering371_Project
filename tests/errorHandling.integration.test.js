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
  // Build the declared indexes so the unique-constraint test is meaningful
  await Promise.all(mongoose.modelNames().map((n) => mongoose.model(n).syncIndexes()));

  // The product/category write routes are admin-only

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
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ productName: 'Bad', description: 'd', price: -1, stock: 1 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/price/i);
  });
});

describe('Categories API', () => {
  const sample = { category: 'Floral', description: 'Fragrances with dominant flower notes.' };

  test('create then list -> 201 then the category comes back', async () => {
    const created = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sample);
    expect(created.statusCode).toBe(201);

    const list = await request(app).get('/api/categories');
    expect(list.statusCode).toBe(200);
    expect(list.body.results).toBe(1);
    expect(list.body.data.categories[0].category).toBe('Floral');
  });

  test('duplicate category name -> 409 via the duplicate-key handler', async () => {
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

  test('missing required description -> 400', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ category: 'Orphan' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/description/i);
  });

  test('update a category -> 200 with the new values', async () => {
    const created = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sample);

    const res = await request(app)
      .put(`/api/categories/${created.body.data.category._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated description.' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.category.description).toBe('Updated description.');
  });

  test('delete a category -> 204, and it is gone', async () => {
    const created = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sample);

    const res = await request(app)
      .delete(`/api/categories/${created.body.data.category._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(204);
    expect(await Category.countDocuments()).toBe(0);
  });

  test('deleting a category that does not exist -> 404', async () => {
    const res = await request(app)
      .delete(`/api/categories/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
});

describe('Unmatched route', () => {
  test('unknown route -> 404 via notFound middleware', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.statusCode).toBe(404);
  });

  test('an unknown /api route is also a 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.statusCode).toBe(404);
  });

  test('a mounted route that lacks required input is not a 404', async () => {
    // /api/auth/login and /api/cart are now mounted
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
