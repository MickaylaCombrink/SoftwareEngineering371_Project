const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Product = require('../src/models/Product');
const Cart = require('../src/models/Cart');
const Order = require('../src/models/Order');
const User = require('../src/models/User');

let mongoServer;

// Two users: a plain customer and an admin
let customerToken;
let adminToken;

beforeAll(async () => {
  // Checkout uses a compensating saga, so a standalone memory server is enough
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Promise.all(mongoose.modelNames().map((n) => mongoose.model(n).syncIndexes()));

  const regCustomer = await request(app).post('/api/auth/register').send({
    firstName: 'Tanya',
    lastName: 'Richards',
    email: 'tanya.richards@gmail.com',
    password: 'tanya123',
  });
  customerToken = regCustomer.body.token;

// Registration never grants the admin role, so promote the account directly
  const adminCredentials = {
    email: 'momelezi.tyini@gmail.com',
    password: 'momelezi123',
  };
  await request(app).post('/api/auth/register').send({
    firstName: 'Momelezi',
    lastName: 'Tyini',
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
  await Cart.deleteMany({});
  await Order.deleteMany({});
});

async function createProduct(overrides = {}) {
  return Product.create({
    productName: 'Midnight Sun',
    description: 'A luminous white-floral bouquet',
    price: 500,
    stock: 10,
    ...overrides,
  });
}

async function seedCartFor(token, product, quantity = 2) {
  return request(app)
    .post('/api/cart/items')
    .set('Authorization', `Bearer ${token}`)
    .send({ productId: product._id.toString(), quantity });
}

describe('Orders', () => {
  test('successful checkout -> 201, stock decremented, cart emptied', async () => {
    const product = await createProduct({ stock: 10 });
    await seedCartFor(customerToken, product, 2);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.data.order.totalPrice).toBe(1000);
    expect(res.body.data.order.items).toHaveLength(1);
    expect((await Product.findById(product._id)).stock).toBe(8);
    const cart = await Cart.findOne({});
    expect(cart.items).toHaveLength(0);
  });

  test('checkout with an empty cart -> 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(400);
  });

  test('checkout when stock ran out -> 422, nothing committed', async () => {
    // Stock is fine when the item is added to the cart (quantity 5 <= stock 5)
    const product = await createProduct({ stock: 5 });
    await seedCartFor(customerToken, product, 5);

    // ...but another buyer reduces it to 1 before this customer checks out
    product.stock = 1;
    await product.save();

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(422);
    // Stock unchanged and no order created
    expect((await Product.findById(product._id)).stock).toBe(1);
    expect(await Order.countDocuments()).toBe(0);
  });

  test('a price change after checkout does not alter the historic order', async () => {
    const product = await createProduct({ price: 500 });
    await seedCartFor(customerToken, product, 2);

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`);
    const orderId = orderRes.body.data.order._id;

    // Change the product price AFTER the order was placed
    await Product.findByIdAndUpdate(product._id, { price: 9999 });

    const getRes = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    const line = getRes.body.data.order.items.find(
      (i) => i.productId.toString() === product._id.toString()
    );
    expect(line.unitPrice).toBe(500);
    expect(getRes.body.data.order.totalPrice).toBe(1000);
  });

  test('GET /api/orders returns only my orders, newest first', async () => {
    const product = await createProduct();
    await seedCartFor(customerToken, product, 1);
    await request(app).post('/api/orders').set('Authorization', `Bearer ${customerToken}`);

    await seedCartFor(customerToken, product, 1);
    await request(app).post('/api/orders').set('Authorization', `Bearer ${customerToken}`);

    // Some other user's order must not appear
    const other = await request(app).post('/api/auth/register').send({
      firstName: 'Other',
      lastName: 'Person',
      email: 'other@example.com',
      password: 'strongpass123',
    });
    await seedCartFor(other.body.token, product, 1);
    await request(app).post('/api/orders').set('Authorization', `Bearer ${other.body.token}`);

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(2);
  });

  test("requesting another user's order by id -> 403, no order data returned", async () => {
    const product = await createProduct();
    await seedCartFor(customerToken, product, 1);
    const mine = await request(app).post('/api/orders').set('Authorization', `Bearer ${customerToken}`);
    const myOrderId = mine.body.data.order._id;

    const other = await request(app).post('/api/auth/register').send({
      firstName: 'Other',
      lastName: 'Person',
      email: 'other2@example.com',
      password: 'strongpass123',
    });

    const res = await request(app)
      .get(`/api/orders/${myOrderId}`)
      .set('Authorization', `Bearer ${other.body.token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.data).toBeUndefined();
  });

  test('an admin can read any order', async () => {
    const product = await createProduct();
    await seedCartFor(customerToken, product, 1);
    const mine = await request(app).post('/api/orders').set('Authorization', `Bearer ${customerToken}`);
    const myOrderId = mine.body.data.order._id;

    const res = await request(app)
      .get(`/api/orders/${myOrderId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.order._id).toBe(myOrderId);
  });

  test('updating order status as a customer -> 403', async () => {
    const product = await createProduct();
    await seedCartFor(customerToken, product, 1);
    const mine = await request(app).post('/api/orders').set('Authorization', `Bearer ${customerToken}`);
    const myOrderId = mine.body.data.order._id;

    const res = await request(app)
      .put(`/api/orders/${myOrderId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderStatus: 'Shipping' });

    expect(res.statusCode).toBe(403);
  });

  test('an admin can update order status', async () => {
    const product = await createProduct();
    await seedCartFor(customerToken, product, 1);
    const mine = await request(app).post('/api/orders').set('Authorization', `Bearer ${customerToken}`);
    const myOrderId = mine.body.data.order._id;

    const res = await request(app)
      .put(`/api/orders/${myOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'Shipping' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.order.orderStatus).toBe('Shipping');
  });
});
