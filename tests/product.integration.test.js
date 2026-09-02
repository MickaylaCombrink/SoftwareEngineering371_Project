// Integration tests for the products API: catalogue filtering, sorting,
// pagination, and the admin-only write routes.
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const User = require('../src/models/User');

let mongoServer;
let adminToken;
let customerToken;
let laptops;
let phones;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Promise.all(mongoose.modelNames().map((n) => mongoose.model(n).syncIndexes()));

  const customer = await request(app).post('/api/auth/register').send({
    firstName: 'Cara',
    lastName: 'Customer',
    email: 'cara.customer@example.com',
    password: 'carapass123',
  });
  customerToken = customer.body.token;

  // Registration never grants the admin role, so promote the account directly
  const adminCredentials = {
    email: 'ada.admin@example.com',
    password: 'adapass123',
  };
  await request(app).post('/api/auth/register').send({
    firstName: 'Ada',
    lastName: 'Admin',
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

beforeEach(async () => {
  await Product.deleteMany({});
  await Category.deleteMany({});

  [laptops, phones] = await Category.create([
    { category: 'Laptops', description: 'Portable computers.' },
    { category: 'Smartphones', description: 'Handsets.' },
  ]);

  await Product.create([
    { productName: 'Budget Laptop', description: 'Entry level notebook', price: 100, stock: 5, category: laptops._id },
    { productName: 'Mid Laptop', description: 'Balanced notebook', price: 500, stock: 0, category: laptops._id },
    { productName: 'Premium Laptop', description: 'Fast notebook', price: 900, stock: 2, category: laptops._id },
    { productName: 'Basic Phone', description: 'Simple handset', price: 250, stock: 7, category: phones._id },
  ]);
});

const names = (res) => res.body.data.products.map((p) => p.productName);

describe('GET /api/products - listing and filtering', () => {
  test('returns every product with pagination metadata', async () => {
    const res = await request(app).get('/api/products');

    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(4);
    expect(res.body.total).toBe(4);
    expect(res.body.page).toBe(1);
    expect(res.body.pages).toBe(1);
  });

  test('populates the category instead of returning a bare id', async () => {
    const res = await request(app).get('/api/products');
    const product = res.body.data.products[0];

    expect(product.category).toEqual(
      expect.objectContaining({ category: expect.any(String) })
    );
  });

  test('filters by category', async () => {
    const res = await request(app).get(`/api/products?category=${phones._id}`);

    expect(res.statusCode).toBe(200);
    expect(names(res)).toEqual(['Basic Phone']);
  });

  test('filters by a price range', async () => {
    const res = await request(app).get('/api/products?minPrice=200&maxPrice=600');

    expect(names(res).sort()).toEqual(['Basic Phone', 'Mid Laptop']);
  });

  test('minPrice=0 is honoured rather than treated as absent', async () => {
    const res = await request(app).get('/api/products?minPrice=0&maxPrice=150');

    expect(names(res)).toEqual(['Budget Laptop']);
  });

  test('inStock=true excludes sold-out products', async () => {
    const res = await request(app).get('/api/products?inStock=true');

    expect(names(res)).not.toContain('Mid Laptop');
    expect(res.body.results).toBe(3);
  });

  test('combines category, price and stock filters', async () => {
    const res = await request(app).get(
      `/api/products?category=${laptops._id}&minPrice=100&maxPrice=950&inStock=true`
    );

    expect(names(res).sort()).toEqual(['Budget Laptop', 'Premium Laptop']);
  });

  test('free-text search matches name and description', async () => {
    const res = await request(app).get('/api/products?q=handset');

    expect(names(res)).toEqual(['Basic Phone']);
  });

  test('an unknown category returns an empty list, not an error', async () => {
    const res = await request(app).get(`/api/products?category=${new mongoose.Types.ObjectId()}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(0);
  });
});

describe('GET /api/products - sorting and pagination', () => {
  test('sort=price-asc orders cheapest first', async () => {
    const res = await request(app).get('/api/products?sort=price-asc');

    expect(names(res)).toEqual(['Budget Laptop', 'Basic Phone', 'Mid Laptop', 'Premium Laptop']);
  });

  test('sort=price-desc orders most expensive first', async () => {
    const res = await request(app).get('/api/products?sort=price-desc');

    expect(names(res)[0]).toBe('Premium Laptop');
  });

  test('limit and page split the results', async () => {
    const first = await request(app).get('/api/products?sort=price-asc&limit=2&page=1');
    const second = await request(app).get('/api/products?sort=price-asc&limit=2&page=2');

    expect(names(first)).toEqual(['Budget Laptop', 'Basic Phone']);
    expect(names(second)).toEqual(['Mid Laptop', 'Premium Laptop']);
    expect(first.body.total).toBe(4);
    expect(first.body.pages).toBe(2);
  });

  test('a page beyond the end returns an empty list with the real total', async () => {
    const res = await request(app).get('/api/products?limit=2&page=9');

    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(0);
    expect(res.body.total).toBe(4);
  });
});

describe('GET /api/products - invalid queries', () => {
  test('a non-numeric minPrice -> 400', async () => {
    const res = await request(app).get('/api/products?minPrice=cheap');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/minPrice/);
  });

  test('minPrice above maxPrice -> 400', async () => {
    const res = await request(app).get('/api/products?minPrice=900&maxPrice=100');

    expect(res.statusCode).toBe(400);
  });

  test('an unsupported sort value -> 400', async () => {
    const res = await request(app).get('/api/products?sort=cheapest');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/sort/);
  });

  test('page=0 -> 400', async () => {
    const res = await request(app).get('/api/products?page=0');

    expect(res.statusCode).toBe(400);
  });

  test('limit is capped rather than allowing an unbounded read', async () => {
    const res = await request(app).get('/api/products?limit=5000');

    expect(res.statusCode).toBe(200);
    expect(res.body.pages).toBe(1);
  });
});

describe('GET /api/products/:id', () => {
  test('returns a single product', async () => {
    const created = await Product.findOne({ productName: 'Basic Phone' });
    const res = await request(app).get(`/api/products/${created._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.product.productName).toBe('Basic Phone');
  });

  test('a valid but unknown id -> 404', async () => {
    const res = await request(app).get(`/api/products/${new mongoose.Types.ObjectId()}`);

    expect(res.statusCode).toBe(404);
  });
});

describe('Product write routes are admin-only', () => {
  const body = { productName: 'New', description: 'd', price: 10, stock: 1 };

  test('creating without a token -> 401', async () => {
    expect((await request(app).post('/api/products').send(body)).statusCode).toBe(401);
  });

  test('creating as a customer -> 403', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(body);

    expect(res.statusCode).toBe(403);
  });

  test('updating and deleting as a customer -> 403', async () => {
    const existing = await Product.findOne({ productName: 'Basic Phone' });

    const update = await request(app)
      .put(`/api/products/${existing._id}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ price: 1 });
    const remove = await request(app)
      .delete(`/api/products/${existing._id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(update.statusCode).toBe(403);
    expect(remove.statusCode).toBe(403);
    expect(await Product.countDocuments()).toBe(4);
  });
});

describe('Admin product management', () => {
  const asAdmin = (method, url) =>
    request(app)[method](url).set('Authorization', `Bearer ${adminToken}`);

  test('creates a product -> 201', async () => {
    const res = await asAdmin('post', '/api/products').send({
      productName: 'Newcomer',
      description: 'Fresh stock',
      price: 42,
      stock: 3,
      category: laptops._id.toString(),
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.product.productName).toBe('Newcomer');
    expect(await Product.countDocuments()).toBe(5);
  });

  test('ignores fields a client is not allowed to set', async () => {
    const res = await asAdmin('post', '/api/products').send({
      productName: 'Sneaky',
      description: 'd',
      price: 10,
      stock: 1,
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date('1999-01-01'),
      injected: 'nope',
    });

    expect(res.statusCode).toBe(201);
    const saved = await Product.findOne({ productName: 'Sneaky' }).lean();
    expect(saved.injected).toBeUndefined();
    expect(new Date(saved.createdAt).getFullYear()).toBeGreaterThan(2000);
  });

  test('missing required fields -> 400', async () => {
    const res = await asAdmin('post', '/api/products').send({ productName: 'Nameless only' });

    expect(res.statusCode).toBe(400);
  });

  test('updates a product -> 200 with the new values', async () => {
    const existing = await Product.findOne({ productName: 'Budget Laptop' });
    const res = await asAdmin('put', `/api/products/${existing._id}`).send({ price: 199 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.product.price).toBe(199);
  });

  test('an update that violates the schema -> 400', async () => {
    const existing = await Product.findOne({ productName: 'Budget Laptop' });
    const res = await asAdmin('put', `/api/products/${existing._id}`).send({ stock: -5 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/stock/i);
  });

  test('an update with no usable fields -> 400', async () => {
    const existing = await Product.findOne({ productName: 'Budget Laptop' });
    const res = await asAdmin('put', `/api/products/${existing._id}`).send({ nonsense: true });

    expect(res.statusCode).toBe(400);
  });

  test('updating an unknown id -> 404', async () => {
    const res = await asAdmin('put', `/api/products/${new mongoose.Types.ObjectId()}`).send({
      price: 1,
    });

    expect(res.statusCode).toBe(404);
  });

  test('deletes a product -> 204 and it is gone', async () => {
    const existing = await Product.findOne({ productName: 'Basic Phone' });
    const res = await asAdmin('delete', `/api/products/${existing._id}`);

    expect(res.statusCode).toBe(204);
    expect(await Product.findById(existing._id)).toBeNull();
  });

  test('deleting an unknown id -> 404', async () => {
    const res = await asAdmin('delete', `/api/products/${new mongoose.Types.ObjectId()}`);

    expect(res.statusCode).toBe(404);
  });
});
