/**
 * PERSON 3 — Shopping Cart API.
 *
 * Integration tests against an in-memory MongoDB, driving the API with
 * supertest. Every cart route requires a JWT (Person 2's `protect`), so a
 * user is registered first and the token is reused for the authenticated
 * calls.
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Product = require('../src/models/Product');
const Cart = require('../src/models/Cart');

let mongoServer;
let token;
let product;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Promise.all(mongoose.modelNames().map((n) => mongoose.model(n).syncIndexes()));

  // Register a user and keep the token.
  const reg = await request(app)
    .post('/api/auth/register')
    .send({
      firstName: 'Nkosinathi',
      lastName: 'Mathenjwa',
      email: 'nkosinathi.mathenjwa@gmail.com',
      password: 'nathi123',
    });
  token = reg.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Product.deleteMany({});
  await Cart.deleteMany({});
  product = await Product.create({
    productName: 'Midnight Sun',
    description: 'A luminous white-floral bouquet',
    price: 500,
    stock: 10,
  });
});

const auth = () => ({ Authorization: `Bearer ${token}` });

describe('Shopping Cart API', () => {
  test('GET /api/cart for a new user -> 200 with an empty cart', async () => {
    const res = await request(app).get('/api/cart').set(auth());
    expect(res.statusCode).toBe(200);
    expect(res.body.data.cart.items).toHaveLength(0);
  });

  test('adding an item -> 200, the item is in the cart', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set(auth())
      .send({ productId: product._id.toString(), quantity: 2 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.cart.items).toHaveLength(1);
    expect(res.body.data.cart.items[0].quantity).toBe(2);
  });

  test('adding the same product twice -> one line item, quantities combined', async () => {
    await request(app).post('/api/cart/items').set(auth()).send({ productId: product._id.toString(), quantity: 2 });

    const res = await request(app)
      .post('/api/cart/items')
      .set(auth())
      .send({ productId: product._id.toString(), quantity: 3 });

    expect(res.body.data.cart.items).toHaveLength(1);
    expect(res.body.data.cart.items[0].quantity).toBe(5);
  });

  test('adding a quantity above available stock -> 422, cart unchanged', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set(auth())
      .send({ productId: product._id.toString(), quantity: 999 });

    expect(res.statusCode).toBe(422);
    const cart = await Cart.findOne({});
    expect(cart.items).toHaveLength(0);
  });

  test('changing quantity to a valid number -> 200 with the new quantity', async () => {
    await request(app).post('/api/cart/items').set(auth()).send({ productId: product._id.toString(), quantity: 2 });

    const res = await request(app)
      .put(`/api/cart/items/${product._id.toString()}`)
      .set(auth())
      .send({ quantity: 7 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.cart.items[0].quantity).toBe(7);
  });

  test('changing quantity below 1 -> 400', async () => {
    await request(app).post('/api/cart/items').set(auth()).send({ productId: product._id.toString(), quantity: 2 });

    const res = await request(app)
      .put(`/api/cart/items/${product._id.toString()}`)
      .set(auth())
      .send({ quantity: 0 });

    expect(res.statusCode).toBe(400);
  });

  test('removing an item -> it is gone from the cart', async () => {
    await request(app).post('/api/cart/items').set(auth()).send({ productId: product._id.toString(), quantity: 2 });

    const res = await request(app)
      .delete('/api/cart/items')
      .set(auth())
      .send({ productId: product._id.toString() });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.cart.items).toHaveLength(0);
  });

  test('removing an item that is not in the cart -> 404', async () => {
    const res = await request(app)
      .delete('/api/cart/items')
      .set(auth())
      .send({ productId: new mongoose.Types.ObjectId().toString() });

    expect(res.statusCode).toBe(404);
  });

  test('the cart total is the sum of unitPrice * quantity', async () => {
    await request(app).post('/api/cart/items').set(auth()).send({ productId: product._id.toString(), quantity: 2 });
    await request(app).post('/api/cart/items').set(auth()).send({ productId: product._id.toString(), quantity: 3 });

    const res = await request(app).get('/api/cart').set(auth());
    // Combined quantity of 5 at price 500
    expect(res.body.subtotal).toBe(2500);
  });

  test('any cart route without a token -> 401', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.statusCode).toBe(401);
  });
});
