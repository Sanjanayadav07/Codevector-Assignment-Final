
require('dotenv').config();
const connectDB = require('./db');
const Product = require('./models/product');

const CATEGORIES = ['Electronics', 'Books', 'Toys & Games', 'Footwear'];

async function run() {
  await connectDB();
  console.log('Simulating live inserts + updates every 3s. Ctrl+C to stop.');

  setInterval(async () => {
    const now = new Date();

    // Insert a few new products at the "top" of the feed.
    const inserts = Array.from({ length: 5 }, (_, i) => ({
      name: `Live Item ${now.getTime()}-${i}`,
      category: CATEGORIES[i % CATEGORIES.length],
      price: Number((Math.random() * 500 + 10).toFixed(2)),
      createdAt: now,
      updatedAt: now,
    }));
    await Product.insertMany(inserts);

    // Update a few random existing products WITHOUT changing createdAt,
    // so their position in the newest-first feed doesn't move.
    const randomDocs = await Product.aggregate([{ $sample: { size: 5 } }]);
    for (const doc of randomDocs) {
      await Product.updateOne(
        { _id: doc._id },
        { $set: { price: Number((Math.random() * 500 + 10).toFixed(2)), updatedAt: new Date() } }
      );
    }

    console.log(`[${now.toISOString()}] inserted 5, updated 5`);
  }, 3000);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
