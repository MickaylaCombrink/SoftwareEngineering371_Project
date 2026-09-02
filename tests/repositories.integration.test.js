const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const {
  productRepository, categoryRepository, userRepository,
  cartRepository, orderRepository,
} = require('../src/repositories');
const Product = require('../src/models/Product');

let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Promise.all(mongoose.modelNames().map((n) => mongoose.model(n).syncIndexes()));
});
afterAll(async () => { await mongoose.disconnect(); await mongoServer.stop(); });

test('declared indexes exist in MongoDB', async () => {
  const names = (m) => m.collection.indexes().then((i) => i.map((x) => x.name));
  const p = await names(Product);
  expect(p).toEqual(expect.arrayContaining(['category_1_price_1','price_1','stock_1','createdAt_-1','product_text_search']));
  const o = await names(mongoose.model('Order'));
  expect(o).toEqual(expect.arrayContaining(['userId_1_createdAt_-1','orderStatus_1_createdAt_-1','paymentStatus_1','items.productId_1']));
  const u = await names(mongoose.model('User'));
  expect(u).toEqual(expect.arrayContaining(['email_1','role_1_createdAt_-1']));
  const c = await names(mongoose.model('Cart'));
  expect(c).toEqual(expect.arrayContaining(['userId_1','items.productId_1']));
});

test('BaseRepository CRUD works through a subclass', async () => {
  const cat = await categoryRepository.create({ category: 'Laptops', description: 'Portable computers' });
  const prod = await productRepository.create({ productName: 'ThinkPad', description: 'Solid', price: 1000, stock: 5, category: cat._id });
  expect(await productRepository.count()).toBe(1);
  expect(await productRepository.findById(prod._id)).toBeTruthy();
  const updated = await productRepository.updateById(prod._id, { price: 900 });
  expect(updated.price).toBe(900);
  expect(await productRepository.exists({ productName: 'ThinkPad' })).toBe(true);
  await productRepository.deleteById(prod._id);
  expect(await productRepository.count()).toBe(0);
  expect(await productRepository.findById(new mongoose.Types.ObjectId())).toBeNull();
});

test('updateById runs schema validators', async () => {
  const p = await productRepository.create({ productName: 'X', description: 'd', price: 10, stock: 1 });
  await expect(productRepository.updateById(p._id, { price: -5 })).rejects.toThrow(/Price cannot be negative/);
});

test('ProductRepository.search builds the catalogue filter', async () => {
  const cat = await categoryRepository.create({ category: 'Phones', description: 'Handsets' });
  await productRepository.create({ productName: 'Cheap', description: 'd', price: 100, stock: 0, category: cat._id });
  await productRepository.create({ productName: 'Mid', description: 'd', price: 500, stock: 3, category: cat._id });
  await productRepository.create({ productName: 'Pricey', description: 'd', price: 900, stock: 2, category: cat._id });
  expect((await productRepository.search({ category: cat._id, minPrice: 200, maxPrice: 800 })).map(p => p.productName)).toEqual(['Mid']);
  expect((await productRepository.search({ category: cat._id, inStock: 'true' })).length).toBe(2);
});

test('decrementStock refuses to oversell', async () => {
  const p = await productRepository.create({ productName: 'Limited', description: 'd', price: 10, stock: 2 });
  expect((await productRepository.decrementStock(p._id, 2)).stock).toBe(0);
  expect(await productRepository.decrementStock(p._id, 1)).toBeNull();
});

test('UserRepository hides then reveals the password hash', async () => {
  await userRepository.create({ firstName: 'A', lastName: 'B', email: 'Test@Example.com', password: 'hashed-value-here' });
  expect(await userRepository.emailExists('test@example.com')).toBe(true);
  expect((await userRepository.findByEmail('TEST@example.com')).password).toBeUndefined();
  expect((await userRepository.findByEmailWithPassword('test@example.com')).password).toBe('hashed-value-here');
});

test('CartRepository creates on first use and clears on checkout', async () => {
  const userId = new mongoose.Types.ObjectId();
  const cart = await cartRepository.findOrCreateByUser(userId);
  expect(cart.items).toHaveLength(0);
  expect((await cartRepository.findOrCreateByUser(userId))._id.toString()).toBe(cart._id.toString());
  cart.items.push({ productId: new mongoose.Types.ObjectId(), name: 'X', unitPrice: 5, quantity: 2 });
  await cart.save();
  expect((await cartRepository.clear(userId)).items).toHaveLength(0);
});

test('OrderRepository scopes by owner and sorts newest first', async () => {
  const mine = new mongoose.Types.ObjectId();
  const theirs = new mongoose.Types.ObjectId();
  const item = [{ productId: new mongoose.Types.ObjectId(), name: 'X', unitPrice: 5, quantity: 1 }];
  const older = await orderRepository.create({ userId: mine, items: item, totalPrice: 5 });
  await new Promise((r) => setTimeout(r, 10));
  const newer = await orderRepository.create({ userId: mine, items: item, totalPrice: 5 });
  const theirOrder = await orderRepository.create({ userId: theirs, items: item, totalPrice: 5 });

  const history = await orderRepository.findByUser(mine);
  expect(history.map((o) => o._id.toString())).toEqual([newer._id.toString(), older._id.toString()]);
  expect(await orderRepository.findByIdForUser(theirOrder._id, mine)).toBeNull();
  expect(await orderRepository.findByIdForUser(theirOrder._id, mine, { isAdmin: true })).toBeTruthy();
  expect((await orderRepository.updateStatus(older._id, 'Shipping')).orderStatus).toBe('Shipping');
});
