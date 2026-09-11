require('dotenv').config();

const { connectDB, disconnectDB } = require('../config/db');
const Product = require('../models/Product');

// Normalises every product's `image` field to a local path the front end can
// actually serve: /images/<slug>.<ext>, resolved by Vite from client/public.
//
// It exists because the seeded data mixes three broken shapes:
//   1. SharePoint sharing links, which return an HTML viewer page, not an
//      image, so no <img> tag can ever render them
//   2. SharePoint links with a local path glued onto the end
//   3. Correct local paths (these are left alone)
//
// Usage:
//   node src/scripts/fixProductImages.js --list        show expected filenames
//   node src/scripts/fixProductImages.js --check       report which files exist
//   node src/scripts/fixProductImages.js --dry         preview changes
//   node src/scripts/fixProductImages.js --ext webp    force one extension
//   node src/scripts/fixProductImages.js               apply

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const LIST = args.includes('--list');
const CHECK = args.includes('--check');

// --ext webp rewrites every product to that extension. Without it each
// product keeps whatever extension it already had.
const extIndex = args.indexOf('--ext');
const FORCE_EXT = extIndex !== -1 ? args[extIndex + 1]?.replace(/^\./, '').toLowerCase() : null;

const IMAGE_DIR = path.join(__dirname, '..', '..', 'client', 'public', 'images');

const DEFAULT_EXT = 'webp';

function slugify(name) {
  return String(name)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Keeps the extension already recorded for this product, if there is one
function extensionFrom(current) {
  if (FORCE_EXT) return FORCE_EXT;
  const match = String(current || '').match(/\.(webp|avif|png|jpe?g)(?:$|[?#])/i);
  return match ? match[1].toLowerCase() : DEFAULT_EXT;
}

function desiredPath(product) {
  const current = product.image?.[0] || '';
  return `/images/${slugify(product.productName)}.${extensionFrom(current)}`;
}

function isClean(current) {
  // A single local path and nothing else stitched onto it
  return /^\/images\/[a-z0-9-]+\.(webp|avif|png|jpe?g)$/i.test(String(current || ''));
}

async function run() {
  await connectDB();

  const products = await Product.find({}).sort({ productName: 1 });
  console.log(`${products.length} products found.\n`);

  if (LIST) {
    console.log('Expected files in client/public/images/:\n');
    products.forEach((product) => {
      console.log(`  ${desiredPath(product).replace('/images/', '')}`);
    });
    console.log('\nAdd a file for each name above, then reload the site.');
    return;
  }

  if (CHECK) {
    const onDisk = fs.existsSync(IMAGE_DIR)
      ? fs.readdirSync(IMAGE_DIR).filter((f) => !f.endsWith('.md'))
      : [];

    // Compared lowercased because Windows ignores case but a Linux host will
    // not — a file that works locally can 404 once deployed.
    const lower = new Map(onDisk.map((f) => [f.toLowerCase(), f]));
    const missing = [];
    const wrongCase = [];

    products.forEach((product) => {
      const wanted = (product.image?.[0] || '').replace('/images/', '');
      const actual = lower.get(wanted.toLowerCase());

      if (!actual) missing.push(`${wanted}   (${product.productName})`);
      else if (actual !== wanted) wrongCase.push(`${actual} should be ${wanted}`);
    });

    const used = new Set(
      products.map((p) => (p.image?.[0] || '').replace('/images/', '').toLowerCase())
    );
    const unused = onDisk.filter((f) => !used.has(f.toLowerCase()));

    console.log(`${onDisk.length} file(s) in client/public/images/\n`);
    console.log(`Matched:  ${products.length - missing.length} / ${products.length}`);

    if (missing.length) {
      console.log(`\nMissing (${missing.length}) — these products fall back to the drawn bottle:`);
      missing.forEach((m) => console.log(`  ${m}`));
    }
    if (wrongCase.length) {
      console.log(`\nWrong case (${wrongCase.length}) — works on Windows, breaks when deployed:`);
      wrongCase.forEach((m) => console.log(`  ${m}`));
    }
    if (unused.length) {
      console.log(`\nIn the folder but not referenced by any product (${unused.length}):`);
      unused.forEach((m) => console.log(`  ${m}`));
    }
    if (!missing.length && !wrongCase.length) console.log('\nEvery product has its image.');
    return;
  }

  let changed = 0;

  for (const product of products) {
    const current = product.image?.[0] || '';
    const target = desiredPath(product);

    if (isClean(current) && current === target) continue;

    console.log(`${product.productName}`);
    console.log(`   was: ${current || '(empty)'}`);
    console.log(`   now: ${target}\n`);
    changed += 1;

    if (!DRY) {
      product.image = [target];
      await product.save();
    }
  }

  if (changed === 0) {
    console.log('Every product already points at a local image path. Nothing to do.');
  } else if (DRY) {
    console.log(`${changed} product(s) would be updated. Re-run without --dry to apply.`);
  } else {
    console.log(`${changed} product(s) updated.`);
  }
}

run()
  .catch((err) => {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
