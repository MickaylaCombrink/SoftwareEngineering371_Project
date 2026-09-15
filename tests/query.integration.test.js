// Contact queries API: public submissions, admin-only triage queue.
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Query = require('../src/models/Query');
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
    email: 'query.customer@example.com',
    password: 'campass123',
  });
  customerToken = customer.body.token;

  // Registration never grants the admin role, so promote the account directly
  const adminCredentials = { email: 'query.admin@example.com', password: 'querypass123' };
  await request(app)
    .post('/api/auth/register')
    .send({ firstName: 'Query', lastName: 'Admin', ...adminCredentials });
  await User.updateOne({ email: adminCredentials.email }, { role: 'admin' });
  const login = await request(app).post('/api/auth/login').send(adminCredentials);
  adminToken = login.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Query.deleteMany({});
});

const asAdmin = (method, url) =>
  request(app)[method](url).set('Authorization', `Bearer ${adminToken}`);

const validBody = {
  name: 'Jane Shopper',
  email: 'jane.shopper@example.com',
  subject: 'Order query',
  message: 'Where is my order?',
};

describe('Submitting a contact query', () => {
  test('any visitor can submit a query -> 201 and it is saved', async () => {
    const res = await request(app).post('/api/queries').send(validBody);

    expect(res.statusCode).toBe(201);
    const saved = await Query.findOne({ email: validBody.email }).lean();
    expect(saved).toMatchObject({
      name: validBody.name,
      subject: validBody.subject,
      message: validBody.message,
    });
    expect(saved.status).toBe('new');
  });

  test('defaults new queries to a "new" status', async () => {
    const res = await request(app).post('/api/queries').send(validBody);

    expect(res.statusCode).toBe(201);
    expect(res.body.data.query.status).toBe('new');
  });

  test('a missing message -> 400', async () => {
    const res = await request(app)
      .post('/api/queries')
      .send({ name: validBody.name, email: validBody.email, subject: validBody.subject });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/message/i);
  });

  test('ignores fields a client is not allowed to set', async () => {
    const res = await request(app)
      .post('/api/queries')
      .send({ ...validBody, injected: 'nope', status: 'resolved' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.query.injected).toBeUndefined();
    expect(res.body.data.query.status).toBe('new');
  });
});

describe('Query triage is admin-only', () => {
  test('listing without a token -> 401', async () => {
    expect((await request(app).get('/api/queries')).statusCode).toBe(401);
  });

  test('listing as a customer -> 403', async () => {
    const res = await request(app)
      .get('/api/queries')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
  });
});

describe('Admin query triage', () => {
  test('lists queries newest first', async () => {
    await Query.create(validBody);
    await new Promise((r) => setTimeout(r, 10));
    await Query.create({ ...validBody, subject: 'Newer one' });

    const res = await asAdmin('get', '/api/queries');

    expect(res.statusCode).toBe(200);
    expect(res.body.data.queries.map((q) => q.subject)).toEqual([
      'Newer one',
      'Order query',
    ]);
  });

  test('fetches one query', async () => {
    const existing = await Query.create(validBody);
    const res = await asAdmin('get', `/api/queries/${existing._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.query.message).toBe(validBody.message);
  });

  test('updates the status -> 200', async () => {
    const existing = await Query.create(validBody);
    const res = await asAdmin('put', `/api/queries/${existing._id}`).send({ status: 'resolved' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.query.status).toBe('resolved');
  });

  test('an invalid status -> 400', async () => {
    const existing = await Query.create(validBody);
    const res = await asAdmin('put', `/api/queries/${existing._id}`).send({ status: 'spammy' });

    expect(res.statusCode).toBe(400);
  });

  test('deletes a query -> 204', async () => {
    const existing = await Query.create(validBody);
    const res = await asAdmin('delete', `/api/queries/${existing._id}`);

    expect(res.statusCode).toBe(204);
    expect(await Query.countDocuments()).toBe(0);
  });

  test('an unknown id -> 404', async () => {
    const res = await asAdmin('get', `/api/queries/${new mongoose.Types.ObjectId()}`);

    expect(res.statusCode).toBe(404);
  });
});