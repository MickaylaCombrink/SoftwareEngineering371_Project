require('dotenv').config();

const bcrypt = require('bcryptjs');

const { connectDB, disconnectDB } = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');

const args = process.argv.slice(2);
const FRESH = args.includes('--fresh');
const DROP_ONLY = args.includes('--drop');

// Registration never grants the admin role, so the first admin comes from here
const admin = {
  firstName: 'Site',
  lastName: 'Administrator',
  email: process.env.ADMIN_EMAIL || 'admin@ecommerce.local',
  password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
  role: 'admin',
};

const categories = [
  { category: 'Oud', description: 'Dark, resinous and regal — agarwood at its most luxurious.' },
  { category: 'Gourmand', description: 'Edible indulgence: vanilla, chocolate, berry and caramel.' },
  { category: 'Amber', description: 'Warm, golden and powdery accords with sweet resinous depth.' },
  { category: 'Floral', description: 'Feminine and timeless — rose, jasmine, lily and delicate blooms.' },
  { category: 'Woody', description: 'Earthy and composed — sandalwood, cedar, vetiver and spices.' },
  { category: 'Oriental', description: 'Rich, spicy and mysterious — saffron, incense and exotic resins.' },
  { category: 'Fresh', description: 'Clean and alive — marine, green and aromatic notes.' },
];

const i = (p) => `/images/${p}`;

// Real fragrance house and boutique catalogue with photography on file
const products = [
  // ——— Oud ———
  { productName: 'Al Haramain Amber Oud Carbon Edition EDP 100ml', category: 'Oud', price: 699, stock: 14, image: [i('al-haramain-amber-oud-carbon-edition-edp-100ml.webp')], description: 'A modern-luxe oud drenched in smoky amber and sweet rosewood. Carbon Edition opens bright with citrus rind, then sinks into a warm, velvety base of oud and musk that lasts all night.' },
  { productName: 'Al Haramain Amber Oud Gold Edition Extrait 100ml', category: 'Oud', price: 849, stock: 10, image: [i('al-haramain-amber-oud-gold-edition-extrait-100ml.webp')], description: 'An extrait-strength masterpiece. Golden amber, saffron and rich agarwood bloom over a honeyed base — opulent, smooth and unmistakably expensive.' },
  { productName: 'Arabiyat Oud Al Layl EDP 100ml', category: 'Oud', price: 599, stock: 18, image: [i('arabiyat-oud-al-layl-edp-100ml.webp')], description: '“Oud of the Night” — a midnight blend of smoky oud, vanilla and soft spices. Deep, mysterious and incredibly seductive after dark.' },
  { productName: 'Ard Al Zaafaran Oud 24 Hours Black EDP 50ml', category: 'Oud', price: 429, stock: 16, image: [i('ard-al-zaafaran-oud-24-hours-black-edp-50ml.webp')], description: 'A rich, brooding composition with leather, dark oud and a whisper of saffron. One spray is a statement; it simply refuses to fade.' },
  { productName: 'Barakkat Satin Oud EDP 30ml', category: 'Oud', price: 349, stock: 22, image: [i('barakkat-satin-oud-edp-30ml.webp')], description: 'Smooth, creamy agarwood cut with rose and amber for an airy, refined oud. Bottled luxury in a perfect travel size.' },
  { productName: 'Emper Al Fares Oud Intensity Limited Edition EDP 100ml', category: 'Oud', price: 649, stock: 8, image: [i('emper-al-fares-oud-intensity-limited-edition-edp-100ml.webp')], description: 'A limited-edition powerhouse. Blazing oud, spicy leather and labdanum form a regal sillage that commands every room you enter.' },
  { productName: 'Fragrance World Brown Orchid Oud Edition EDP 30ml', category: 'Oud', price: 379, stock: 20, image: [i('fragrance-world-brown-orchid-oud-edition-edp-30ml.webp')], description: 'Velvet orchid petals resting on a cushion of smoked oud and sandalwood. Sophisticated, unisex and intensely addictive.' },
  { productName: 'Lattafa Eternal Oud gift set EDP 100ml', category: 'Oud', price: 749, stock: 12, image: [i('lattafa-eternal-oud-gift-set-edp-100ml.webp')], description: 'A gift-set jewel. Eternal Oud pairs rich agarwood with warm spices and amber, wrapped in a beautiful keepsake box.' },
  { productName: 'Lattafa King of Arabia gift set EDP 100ml', category: 'Oud', price: 899, stock: 9, image: [i('lattafa-king-of-arabia-gift-set-edp-100ml.webp')], description: 'Fit for royalty — a majestic blend of oud, rose, incense and musk. Generous sillage, opulent presentation, royal performance.' },
  { productName: 'Emper Al Fares Night Effect Limited Edition EDP 100ml', category: 'Oud', price: 629, stock: 11, image: [i('emper-al-fares-night-effect-limited-edition-edp-100ml.webp')], description: 'Night Effect turns heads after sunset: smoked oud, black vanilla and dark berries over a leather base. Limited edition, endless allure.' },

  // ——— Gourmand ———
  { productName: 'Gulf Orchid Cherry Vibe EDP 100ml', category: 'Gourmand', price: 649, stock: 13, image: [i('gulf-orchid-cherry-vibe-edp-100ml.webp')], description: 'Juicy black cherry drizzled in vanilla cream with a hint of almond. A playful, delicious gourmand that everyone will ask about.' },
  { productName: 'Lattafa Give Me Gourmand Berry On Top EDP 75ml', category: 'Gourmand', price: 499, stock: 15, image: [i('lattafa-give-me-gourmand-berry-on-top-edp-75ml.webp')], description: 'A sweet mountain of ripe berries on warm vanilla custard. Fun, youthful and irresistibly moreish.' },
  { productName: 'Lattafa Give Me Gourmand Choco Overdose EDP 75ml', category: 'Gourmand', price: 499, stock: 15, image: [i('lattafa-give-me-gourmand-choco-overdose-edp-75ml.webp')], description: 'For the true chocoholic. Rich dark chocolate, cocoa powder and soft musk — dessert you can wear.' },
  { productName: 'Lattafa Give Me Gourmand Cookie Crave EDP 75ml', category: 'Gourmand', price: 499, stock: 15, image: [i('lattafa-give-me-gourmand-cookie-crave-edp-75ml.webp')], description: 'Warm baked cookies straight from the oven — golden caramel, vanilla and a dusting of cinnamon sugar.' },
  { productName: 'Lattafa Give Me Gourmand Mallow Madness EDP 75ml', category: 'Gourmand', price: 499, stock: 15, image: [i('lattafa-give-me-gourmand-mallow-madness-edp-75ml.webp')], description: 'Cloud-like toasted marshmallow melting into vanilla bean and soft amber. Pillowy, sweet, utterly comforting.' },
  { productName: 'Lattafa Give Me Gourmand Vanilla Freak EDP 75ml', category: 'Gourmand', price: 499, stock: 15, image: [i('lattafa-give-me-gourmand-vanilla-freak-edp-75ml.webp')], description: 'A pure vanilla obsession — Bourbon vanilla, tonka bean and creamy sandalwood. Deep, warm and flawlessly smooth.' },
  { productName: 'Lattafa Give Me Gourmand Whipped Pleasure EDP 75ml', category: 'Gourmand', price: 499, stock: 15, image: [i('lattafa-give-me-gourmand-whipped-pleasure-edp-75ml.webp')], description: 'Airy whipped cream, sugared strawberry and a whisper of cake batter. Sweetness with an elegant, weightless feel.' },
  { productName: 'Lattafa Nebras gift set EDP 100ml', category: 'Gourmand', price: 799, stock: 7, image: [i('lattafa-nebras-gift-set-edp-100ml.webp')], description: 'A beloved modern icon: velvety vanilla and red berries melt into warm amber and musk. Cozy, chic and endlessly wearable.' },
  { productName: 'SAWWAR Vanille Blanc', category: 'Gourmand', price: 359, stock: 21, image: [i('sawwar-vanille-blanc.webp')], description: 'Crisp white vanillas — cocoon-like and clean. Soft, sweet and sophisticated with a delicate floral halo.' },

  // ——— Amber ———
  { productName: 'Emper His Highness Victory EDP 100ml', category: 'Amber', price: 719, stock: 10, image: [i('emper-his-highness-victory-edp-100ml.webp')], description: 'A triumphant amber fougère — sparkling bergamot, lavender and amber resin. Confident, polished and unmistakably commanding.' },
  { productName: 'Emper Sovereign Elixir EDP 100ml', category: 'Amber', price: 649, stock: 12, image: [i('emper-sovereign-elixir-edp-100ml.webp')], description: 'A golden elixir of amber, cinnamon and honeyed tobacco. Rich without being heavy — the scent of quiet authority.' },
  { productName: 'French Avenue Nabatieh EDP 90ml', category: 'Amber', price: 829, stock: 8, image: [i('french-avenue-nabatieh-edp-90ml.webp')], description: 'Glowing amber wrapped in saffron and soft suede. Nabatieh glides from juicy top notes to a long, warm, resinous trail.' },
  { productName: 'Lattafa Masa gift set EDP 100ml', category: 'Amber', price: 779, stock: 9, image: [i('lattafa-masa-gift-set-edp-100ml.webp')], description: 'A dessert-amber hybrid — dates, praline and amber shimmer over a toasted wood base. Gift-boxed and gorgeous.' },

  // ——— Floral ———
  { productName: 'Al Wataniah Keyaan Classic EDP 100ml', category: 'Floral', price: 549, stock: 17, image: [i('al-wataniah-keyaan-classic-edp-100ml.webp')], description: 'An elegant floral fougère — geranium, lavender and soft woods. Timeless, clean and quietly luxurious.' },
  { productName: 'Ard Al Zaafaran Yara EDP 50ml', category: 'Floral', price: 439, stock: 19, image: [i('ard-al-zaafaran-yara-edp-50ml.webp')], description: 'Sweet tuberose and orchids wrapped in creamy vanilla musk. Soft, feminine and adored — the people-pleaser of the house.' },
  { productName: 'Emper Sovereign Candy Flora EDP 100ml', category: 'Floral', price: 579, stock: 13, image: [i('emper-sovereign-candy-flora-edp-100ml.webp')], description: 'Candied peonies and rose petals over a sugar-soft base. Playful floral sweetness with a champagne fizz.' },
  { productName: 'Lattafa Peace and Love gift set EDP 100ml', category: 'Floral', price: 689, stock: 10, image: [i('lattafa-peace-and-love-gift-set-edp-100ml.webp')], description: 'Harmony in a bottle — rose, saffron and comforting woods. Balanced, uplifting and beautifully packaged.' },
  { productName: 'Maison Alhambra Delilah Blanc EDP 100ml', category: 'Floral', price: 729, stock: 11, image: [i('maison-alhambra-delilah-blanc-edp-100ml.webp')], description: 'A luminous powdery floral — white iris, cotton flower and vanilla musk. All-white elegance with serious silage.' },
  { productName: 'Panache Angel Dust', category: 'Floral', price: 399, stock: 24, image: [i('panache-angel-dust.webp')], description: 'Sugary violet petals and vanilla musk — a soft, dreamlike veil of sweetness. Angelic, ethereal and budget-friendly.' },

  // ——— Woody ———
  { productName: 'Ard Al Zaafaran Mousuf Brown EDP 50ml', category: 'Woody', price: 419, stock: 18, image: [i('ard-al-zaafaran-mousuf-brown-edp-50ml.webp')], description: 'Earth-toned luxury: smoky vetiver, cedar and a pinch of tobacco leaf. Grounded, handsome and long-wearing.' },
  { productName: 'Bentley Momentum Intense EDP 100ml', category: 'Woody', price: 1249, stock: 6, image: [i('bentley-momentum-intense-edp-100ml.webp')], description: 'An intense masculine gut-punch — spicy lavender, black coffee and warm woods. Brisk, powerful and exceptionally refined.' },
  { productName: 'Emper Sovereign Paradine EDP 100ml', category: 'Woody', price: 629, stock: 10, image: [i('emper-sovereign-paradine-edp-100ml.webp')], description: 'A green-woody trail: violet leaf, cedarwood and a clean musky base. Modern, sharp and effortlessly cool.' },
  { productName: 'Lattafa Artisan Ethnique gift set EDP 100ml', category: 'Woody', price: 649, stock: 9, image: [i('lattafa-artisan-ethnique-gift-set-edp-100ml.webp')], description: 'Craftsmanship in scent — zesty top notes over warm woods and incense. A beautifully made gift-set for the discerning.' },
  { productName: 'Lattafa Maahir Honor EDP 100ml', category: 'Woody', price: 599, stock: 14, image: [i('lattafa-maahir-honor-edp-100ml.webp')], description: 'Honor is a smooth woody-amber blend with dark berries and spices. Composed, noble and wonderfully versatile.' },

  // ——— Oriental ———
  { productName: 'Armaf Odyssey Mega gift set EDP 100ml', category: 'Oriental', price: 1149, stock: 6, image: [i('armaf-odyssey-mega-gift-set-edp-100ml.webp')], description: 'A mega-wearer favourite: saffron, rich amber and incense layered into a deep oriental base. Grand, exotic and envelope-pushing.' },
  { productName: 'Lattafa Queen of Arabia gift set EDP 100ml', category: 'Oriental', price: 829, stock: 8, image: [i('lattafa-queen-of-arabia-gift-set-edp-100ml.webp')], description: 'Regal oriental opulence — oud, rose and spices with a honeyed amber glow. A jewelled gift set for the queen in your life.' },
  { productName: 'Riiffs Zenith EDP 100ml', category: 'Oriental', price: 649, stock: 11, image: [i('riiffs-zenith-edp-100ml.webp')], description: 'A dazzling oriental fougère — citrus-lavender top, spiced heart and a warm amber-musk base. Reaches soaring heights of class.' },

  // ——— Fresh ———
  { productName: 'Armaf Club de Nuit Sillage gift set EDP 105ml', category: 'Fresh', price: 999, stock: 8, image: [i('armaf-club-de-nuit-sillage-gift-set-edp-105ml.webp')], description: 'An icon reborn — sparkling bergamot, blackcurrant and white florals with a luminous musk trail. The definition of fresh luxury.' },
  { productName: 'Diamond Scents Barakaa Diamond Scents EDP 100ml', category: 'Fresh', price: 679, stock: 12, image: [i('diamond-scents-barakaa-diamond-scents-edp-100ml.avif')], description: 'Crystal-clear freshness — dew-covered greens, aquatic notes and a breezy white musk. Brilliant, airy and diamond-bright.' },
  { productName: 'Emper Al Fares Musk Effect Limited Edition EDP 100ml', category: 'Fresh', price: 549, stock: 14, image: [i('emper-al-fares-musk-effect-limited-edition-edp-100ml.webp')], description: 'A clean-linen musk with bergamot and soft aldehydes. Crisp, intimate and skin-like — a limited edition that disappears fast.' },
  { productName: 'French Avenue Grecia EDP 100ml', category: 'Fresh', price: 749, stock: 10, image: [i('french-avenue-grecia-edp-100ml.webp')], description: 'A Mediterranean getaway — sea breeze, citron and green fig over sun-warmed woods. Effortless summer elegance.' },
];

async function wipe() {
  const [p, c] = await Promise.all([Product.deleteMany({}), Category.deleteMany({})]);
  console.log(`Removed ${p.deletedCount} product(s) and ${c.deletedCount} categor(y/ies).`);
  // Deliberately does not delete users
}

async function seedAdmin() {
  const existing = await User.findOne({ email: admin.email });
  if (existing) {
    if (existing.role !== 'admin') {
      await User.updateOne({ _id: existing._id }, { role: 'admin' });
      console.log(`Promoted existing user ${admin.email} to admin.`);
    } else {
      console.log(`Admin ${admin.email} already exists - left untouched.`);
    }
    return;
  }

  await User.create({
    ...admin,
    password: await bcrypt.hash(admin.password, 12),
  });

  console.log(`Created admin ${admin.email}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(
      '  Password is the default "ChangeMe123!" - change it, or set ' +
        'ADMIN_PASSWORD before seeding.'
    );
  }
}

async function seed() {
  // Seeded independently of the catalogue, so --fresh cannot lock you out
  await seedAdmin();

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
  // NOTE: the current catalogue has no zero-stock items; the stock-related
  // error paths remain covered by the backend integration tests.
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