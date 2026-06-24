
require('dotenv').config();
const connectDB = require('./db');
const Product = require('./models/product');

const TOTAL = parseInt(process.env.PRODUCT_COUNT || '200000', 10);
const BATCH_SIZE = 5000;

const CATEGORIES = [
  'Electronics', 'Home & Kitchen', 'Books', 'Sports & Outdoors',
  'Toys & Games', 'Beauty & Personal Care', 'Clothing', 'Footwear',
  'Automotive', 'Grocery', 'Office Supplies', 'Pet Supplies',
  'Furniture', 'Health', 'Music & Instruments',
];

const ADJECTIVES = [
  'Premium', 'Compact', 'Wireless', 'Portable', 'Classic', 'Eco-Friendly',
  'Heavy-Duty', 'Smart', 'Lightweight', 'Deluxe', 'Professional', 'Mini',
  'Ultra', 'Everyday', 'Adjustable',
];

const NOUNS = [
  'Speaker', 'Backpack', 'Notebook', 'Water Bottle', 'Desk Lamp', 'Headphones',
  'Charger', 'Chair', 'Blender', 'Running Shoes', 'Jacket', 'Watch',
  'Keyboard', 'Mouse', 'Yoga Mat', 'Tent', 'Sunglasses', 'Wallet',
  'Toothbrush', 'Air Fryer',
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPastDate(daysBack) {
  const now = Date.now();
  const past = now - randInt(0, daysBack * 24 * 60 * 60 * 1000);
  return new Date(past);
}

function buildProduct() {
  const adjective = ADJECTIVES[randInt(0, ADJECTIVES.length - 1)];
  const noun = NOUNS[randInt(0, NOUNS.length - 1)];
  const category = CATEGORIES[randInt(0, CATEGORIES.length - 1)];
  const createdAt = randomPastDate(180); // spread across the last 6 months
  return {
    name: `${adjective} ${noun}`,
    category,
    price: Number((Math.random() * 4990 + 10).toFixed(2)), // 10.00 - 5000.00
    createdAt,
    updatedAt: createdAt,
  };
}

async function seed() {
  await connectDB();

  console.log(`Clearing existing products...`);
  await Product.deleteMany({});

  console.log(`Seeding ${TOTAL} products in batches of ${BATCH_SIZE}...`);
  const start = Date.now();

  for (let inserted = 0; inserted < TOTAL; inserted += BATCH_SIZE) {
    const size = Math.min(BATCH_SIZE, TOTAL - inserted);
    const batch = Array.from({ length: size }, buildProduct);
    await Product.insertMany(batch, { ordered: false });
    process.stdout.write(`\rInserted ${inserted + size}/${TOTAL}`);
  }

  const seconds = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nDone in ${seconds}s.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
