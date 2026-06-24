# CodeVector Backend Assignment

A backend service for browsing, filtering, and paginating 200,000+ products efficiently using MongoDB and Express.js.

## Tech Stack

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose

## Features

* Browse products sorted by newest first
* Filter products by category
* Cursor-based pagination
* Stable pagination during concurrent inserts/updates
* Bulk seed script for generating 200,000 products
* Optimized MongoDB indexes
* REST API

## Why Cursor-Based Pagination?

Traditional offset pagination (`skip()` + `limit()`) becomes slower as the page number increases because MongoDB must scan and skip more documents.

Example:

```javascript
Product.find()
  .sort({ createdAt: -1 })
  .skip(100000)
  .limit(20);
```

This approach is inefficient on large datasets and can produce duplicate or missing records when new products are inserted while a user is browsing.

Instead, this project uses cursor-based pagination.

The cursor stores the last product's:

* `createdAt`
* `_id`

The next page fetches products strictly older than that cursor.

Benefits:

* Consistent query performance
* No expensive skips
* No duplicate records
* No missing records
* Stable while new products are being added

## Database Indexes

### Global Feed

```javascript
ProductSchema.index({ createdAt: -1, _id: -1 });
```

### Category Filtered Feed

```javascript
ProductSchema.index({
  category: 1,
  createdAt: -1,
  _id: -1,
});
```

These indexes allow MongoDB to perform efficient index scans without in-memory sorting.

## API Endpoints

### Get Products

```http
GET /api/products
```

Query Parameters:

| Parameter | Description                 |
| --------- | --------------------------- |
| limit     | Number of products per page |
| category  | Filter by category          |
| cursor    | Pagination cursor           |

Example:

```http
GET /api/products?limit=20
```

```http
GET /api/products?category=Electronics&limit=20
```

```http
GET /api/products?cursor=<cursor>
```

Response:

```json
{
  "products": [],
  "nextCursor": "cursor_value",
  "hasMore": true
}
```

### Get Categories

```http
GET /api/categories
```

Response:

```json
{
  "categories": [
    "Electronics",
    "Books",
    "Furniture"
  ]
}
```

### Health Check

```http
GET /api/health
```

Response:

```json
{
  "status": "ok"
}
```

## Environment Variables

Create a `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

## Installation

```bash
git clone <repository-url>
cd Codevector-Assignment-Final
npm install
```

## Running Locally

```bash
npm run dev
```

Server runs on:

```text
http://localhost:3000
```

## Generate 200,000 Products

```bash
npm run seed
```

The seed script:

* Generates realistic product data
* Creates 200,000 products
* Uses batch inserts (`insertMany`)
* Minimizes database round trips
* Improves seeding performance

## Project Structure

```text
src/
├── models/
│   └── Product.js
├── db.js
├── cursor.js
├── index.js
├── seed.js
└── simulateLiveUpdates.js
```

## Scalability Considerations

* Cursor-based pagination
* Compound indexes
* Bulk database writes
* Lean queries (`.lean()`)
* No count query on every request
* Stable ordering using `createdAt + _id`

## Future Improvements

* Automated testing
* API documentation with Swagger
* Request validation
* Rate limiting
* Caching layer
* Monitoring and analytics

## AI Usage

AI tools were used to:

* Discuss architecture choices
* Review pagination strategies
* Improve documentation
* Validate indexing approaches

All generated code was reviewed, understood, and modified where necessary before use.

## Author

Sanjana Yadav
