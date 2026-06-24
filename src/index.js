require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./db');
const Product = require('./models/product');
const { encodeCursor, decodeCursor } = require('./cursor');

const app = express();
app.use(cors());
app.use(express.json());

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

app.get('/api/products', async (req, res) => {
  try {
    const limit = Math.min(
      parseInt(req.query.limit, 10) || DEFAULT_LIMIT,
      MAX_LIMIT
    );
    const { category, cursor } = req.query;

    const filter = {};
    if (category) filter.category = category;

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (!decoded) {
        return res.status(400).json({ error: 'Invalid cursor' });
      }
      // "Strictly older than the last item seen": either an earlier
      // createdAt, or the same createdAt with a smaller _id (tiebreaker
      // for the (likely) many products sharing a timestamp).
      filter.$or = [
        { createdAt: { $lt: decoded.createdAt } },
        {
          createdAt: decoded.createdAt,
          _id: { $lt: new mongoose.Types.ObjectId(decoded.id) },
        },
      ];
    }

    // Fetch one extra row to know whether there's a next page, without a
    // separate count query.
    const docs = await Product.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = docs.length > limit;
    const page = hasMore ? docs.slice(0, limit) : docs;

    res.json({
      products: page,
      nextCursor: hasMore ? encodeCursor(page[page.length - 1]) : null,
      hasMore,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Lets the frontend populate a category filter dropdown.
app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ categories: categories.sort() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}).catch((err) => {
  console.error('Failed to connect to DB:', err);
  process.exit(1);
});
