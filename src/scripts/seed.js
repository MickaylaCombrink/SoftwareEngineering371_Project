/**
 * Database seed script (Person 4 — Error Handling and Categories).
 *
 * Fills the database with test categories and products so the API and the
 * front end have something to work against.
 *
 *   npm run seed          insert the sample data (skips if already seeded)
 *   npm run seed -- --fresh   wipe categories + products first, then insert
 *   npm run seed -- --drop    wipe categories + products and stop
 *
 * Safety: refuses to run against NODE_ENV=production, so nobody can wipe
 * a live catalogue by muscle memory.
 */
require('dotenv').config();

const { connectDB, disconnectDB } = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');

const args = process.argv.slice(2);
const FRESH = args.includes('--fresh');
const DROP_ONLY = args.includes('--drop');

const categories = [
  { category: 'Laptops', description: 'Portable computers for work and study.' },
  { category: 'Smartphones', description: 'Mobile phones and accessories.' },
  { category: 'Audio', description: 'Headphones, earbuds and speakers.' },
  { category: 'Peripherals', description: 'Keyboards, mice and monitors.' },
  { category: 'Gaming', description: 'Consoles, controllers and games.' },
];

// Products reference categories by NAME here; the ids are resolved after the
// categories are inserted, so this list stays readable and easy to extend.
const products = [
  { productName: 'ThinkPad X1 Carbon', category: 'Laptops', description: '14" business ultrabook, 16GB RAM, 512GB SSD.', price: 28999.99, stock: 12, image: ['https://placehold.co/600x400?text=X1+Carbon'] },
  { productName: 'MacBook Air M3', category: 'Laptops', description: '13" fanless laptop, 8GB RAM, 256GB SSD.', price: 24499.0, stock: 8, image: ['https://placehold.co/600x400?text=MacBook+Air'] },
  { productName: 'Dell Inspiron 15', category: 'Laptops', description: 'Everyday 15.6" laptop, 8GB RAM, 512GB SSD.', price: 11999.5, stock: 0, image: ['https://placehold.co/600x400?text=Inspiron+15'] },
  { productName: 'Samsung Galaxy S24', category: 'Smartphones', description: '6.2" AMOLED, 128GB, triple camera.', price: 18999.0, stock: 25, image: ['https://placehold.co/600x400?text=Galaxy+S24'] },
  { productName: 'iPhone 15', category: 'Smartphones', description: '6.1" display, 128GB, USB-C.', price: 19999.0, stock: 15, image: ['https://placehold.co/600x400?text=iPhone+15'] },
  { productName: 'Nokia 3210 (2024)', category: 'Smartphones', description: 'Reissued feature phone with a month of standby.', price: 1299.0, stock: 40, image: ['https://placehold.co/600x400?text=Nokia+3210'] },
  { productName: 'Sony WH-1000XM5', category: 'Audio', description: 'Over-ear noise cancelling headphones.', price: 6999.0, stock: 18, image: ['https://placehold.co/600x400?text=WH-1000XM5'] },
  { productName: 'JBL Flip 6', category: 'Audio', description: 'Portable waterproof Bluetooth speaker.', price: 1899.99, stock: 30, image: ['https://placehold.co/600x400?text=JBL+Flip+6'] },
  { productName: 'Logitech MX Master 3S', category: 'Peripherals', description: 'Ergonomic wireless mouse, 8K DPI.', price: 1999.0, stock: 22, image: ['https://placehold.co/600x400?text=MX+Master+3S'] },
  { productName: 'Keychron K2 Pro', category: 'Peripherals', description: '75% hot-swappable mechanical keyboard.', price: 2499.0, stock: 14, image: ['https://placehold.co/600x400?text=Keychron+K2'] },
  { productName: 'LG 27" 4K Monitor', category: 'Peripherals', description: '27-inch IPS 4K display with USB-C.', price: 8499.0, stock: 6, image: ['https://placehold.co/600x400?text=LG+27+4K'] },
  { productName: 'PlayStation 5 Slim', category: 'Gaming', description: 'Disc edition console, 1TB SSD.', price: 13999.0, stock: 5, image: ['https://placehold.co/600x400?text=PS5+Slim'] },
  { productName: 'Xbox Series X', category: 'Gaming', description: '4K console, 1TB SSD.', price: 13499.0, stock: 0, image: ['https://placehold.co/600x400?text=Xbox+Series+X'] },
  { productName: 'DualSense Controller', category: 'Gaming', description: 'Wireless controller with haptic feedback.', price: 1499.0, stock: 35, image: ['https://placehold.co/600x400?text=DualSense'] },
];

async function wipe() {
  const [p, c] = await Promise.all([Product.deleteMany({}), Category.deleteMany({})]);
  console.log(`Removed ${p.deletedCount} product(s) and ${c.deletedCount} categor(y/ies).`);
}

async function seed() {
  const existing = await Category.countDocuments();
  if (existing > 0 && !FRESH) {
    console.log(
      `Database already has ${existing} categor(y/ies). ` +
        'Re-run with --fresh to wipe and reseed. Nothing changed.'
    );
    return;
  }

  if (FRESH) await wipe();

  const insertedCategories = await Category.insertMany(categories);
  console.log(`Inserted ${insertedCategories.length} categories.`);

  // name -> _id, so each product can be linked to its category
  const idByName = new Map(insertedCategories.map((c) => [c.category, c._id]));

  const productDocs = products.map(({ category, ...rest }) => {
    const categoryId = idByName.get(category);
    if (!categoryId) {
      throw new Error(
        `Seed data error: product "${rest.productName}" references unknown category "${category}".`
      );
    }
    return { ...rest, category: categoryId };
  });

  const insertedProducts = await Product.insertMany(productDocs);
  console.log(`Inserted ${insertedProducts.length} products.`);

  const outOfStock = insertedProducts.filter((p) => p.stock === 0).length;
  console.log(
    `(${outOfStock} deliberately out of stock, so the ?inStock=true filter ` +
      'and the "quantity exceeds stock -> 422" path have something to hit.)'
  );
}

(async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to seed: NODE_ENV is "production".');
    process.exit(1);
  }

  try {
    await connectDB();

    if (DROP_ONLY) {
      await wipe();
    } else {
      await seed();
    }

    console.log('Done.');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    await disconnectDB().catch(() => {});
    process.exit(1);
  }
})();
