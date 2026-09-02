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
  { category: 'Floral', description: 'Fragrances with dominant flower notes such as rose, jasmine and lily.' },
  { category: 'Woody', description: 'Warm, earthy scents built on sandalwood, cedar and oud.' },
  { category: 'Citrus', description: 'Bright, zesty fragrances featuring lemon, bergamot and orange.' },
  { category: 'Oriental', description: 'Rich, spicy compositions with amber, vanilla and exotic resins.' },
  { category: 'Fresh', description: 'Light, clean scents inspired by the ocean, green notes and herbs.' },
];

// Products reference categories by NAME here; the ids are resolved after the
// categories are inserted, so this list stays readable and easy to extend.
const products = [
  // --- Floral ---
  { productName: 'Midnight Sun', category: 'Floral', description: 'A luminous white-floral bouquet with notes of jasmine and ylang-ylang over a soft musk base.', price: 479.99, stock: 25, image: ['https://placehold.co/600x400?text=Midnight+Sun'] },
  { productName: 'Rose d\'Or', category: 'Floral', description: 'Centifolia rose intertwined with pink pepper and a whisper of raspberry leaf.', price: 649.00, stock: 18, image: ['https://placehold.co/600x400?text=Rose+dOr'] },
  { productName: 'Lily Bloom', category: 'Floral', description: 'Fresh water lily and freesia layered over a base of white cedarwood.', price: 399.99, stock: 0, image: ['https://placehold.co/600x400?text=Lily+Bloom'] },

  // --- Woody ---
  { productName: 'Koedoe', category: 'Woody', description: 'A bold, Africa-inspired woody fragrance with vetiver, patchouli and smoked oud.', price: 899.99, stock: 12, image: ['https://placehold.co/600x400?text=Koedoe'] },
  { productName: 'Twilight Mist', category: 'Woody', description: 'A natural, soothing forest-like fragrance with pine, moss and warm amber undertones.', price: 599.99, stock: 20, image: ['https://placehold.co/600x400?text=Twilight+Mist'] },
  { productName: 'Sandalwood Reserve', category: 'Woody', description: 'Creamy Indian sandalwood softened by tonka bean and dried fig.', price: 749.00, stock: 0, image: ['https://placehold.co/600x400?text=Sandalwood+Reserve'] },

  // --- Citrus ---
  { productName: 'Bergamot Burst', category: 'Citrus', description: 'Sparkling Calabrian bergamot accented with white tea and a musk dry-down.', price: 349.99, stock: 30, image: ['https://placehold.co/600x400?text=Bergamot+Burst'] },
  { productName: 'Lemon Groove', category: 'Citrus', description: 'Sicilian lemon and grapefruit lifted by basil and sea salt.', price: 299.00, stock: 22, image: ['https://placehold.co/600x400?text=Lemon+Groove'] },
  { productName: 'Orange Zest', category: 'Citrus', description: 'Sweet blood orange blended with neroli and a touch of cardamom.', price: 329.99, stock: 15, image: ['https://placehold.co/600x400?text=Orange+Zest'] },

  // --- Oriental ---
  { productName: 'Velvet Oud', category: 'Oriental', description: 'A deep, intoxicating blend of oud, black vanilla and smoky incense.', price: 1199.99, stock: 8, image: ['https://placehold.co/600x400?text=Velvet+Oud'] },
  { productName: 'Amber Royale', category: 'Oriental', description: 'Golden amber, cinnamon bark and candied apricot sealed with labdanum.', price: 849.00, stock: 10, image: ['https://placehold.co/600x400?text=Amber+Royale'] },
  { productName: 'Spice Route', category: 'Oriental', description: 'A journey through saffron, cardamom and tonka bean over a sandalwood base.', price: 699.99, stock: 0, image: ['https://placehold.co/600x400?text=Spice+Route'] },

  // --- Fresh ---
  { productName: 'Ocean Breeze', category: 'Fresh', description: 'Cool marine notes with driftwood, sea kelp and a transparent musk.', price: 429.99, stock: 28, image: ['https://placehold.co/600x400?text=Ocean+Breeze'] },
  { productName: 'Green Valley', category: 'Fresh', description: 'Crisp green apple, crushed mint and dewy cucumber over a white musk trail.', price: 379.00, stock: 20, image: ['https://placehold.co/600x400?text=Green+Valley'] },
  { productName: 'Arctic Frost', category: 'Fresh', description: 'Icy eucalyptus and frozen peppermint with an ozone and cedar finish.', price: 449.99, stock: 16, image: ['https://placehold.co/600x400?text=Arctic+Frost'] },
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
