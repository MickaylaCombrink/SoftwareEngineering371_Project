# SoftwareEngineering371_Project — Milestone 2 (Backend)

Express + MongoDB REST API for the e-commerce application.

## Getting started

```bash
npm install
cp .env.example .env     # then fill in MONGO_URI and JWT_SECRET
npm run dev              # nodemon
npm start                # plain node
npm test                 # jest + supertest against an in-memory MongoDB
npm run seed             # fill the database with test categories + products
```

The API listens on `PORT` (default 5000). `GET /api/health` is a cheap
liveness check.

> **Status.** Authentication (`/api/auth`), the cart (`/api/cart`) and
> orders (`/api/orders`) are implemented and covered by integration
> tests. See `HANDOVER.md` for the per-person breakdown.

## Folder structure

```
src/
  server.js        entry point: connects to Mongo, then listens
  app.js           Express app: middleware, route mounting, error handlers
  config/
    db.js          connectDB() / disconnectDB() — cached single connection
  models/          Mongoose schemas and their indexes
  repositories/    data access layer (BaseRepository + one per model)
  controllers/     HTTP concerns only
  routes/          route tables, auth guards applied here
  middleware/      notFound, errorHandler
  scripts/         seed.js — fills the database with test data
  utils/           AppError, catchAsync
tests/             jest integration tests
```

Layering: **routes -> controllers -> repositories -> models**. Controllers
handle HTTP (status codes, response shape); repositories own the queries;
models own the schema.

## Data access layer

Each repository is exported as a ready-made singleton:

```js
const { productRepository } = require('../repositories');

const products = await productRepository.search(req.query);
const product  = await productRepository.findById(req.params.id);
```

`BaseRepository` provides `findAll`, `findById`, `findOne`, `create`,
`updateById`, `deleteById`, `count` and `exists`. Each of these accepts an
options object (`{ sort, limit, skip, select, populate, session }`), so
transactions and populated reads go through the same methods.

Repositories return `null` for "not found" rather than throwing — turning
that into a 404 is the controller's job, via `AppError`.

Model-specific helpers worth knowing:

| Repository | Method | Purpose |
|---|---|---|
| `productRepository` | `search(query)` | builds the catalogue filter from the query string |
| | `decrementStock(id, qty, { session })` | atomic, refuses to oversell |
| `userRepository` | `findByEmailWithPassword(email)` | login path; includes the hash |
| | `emailExists(email)` | duplicate-registration check |
| `cartRepository` | `findOrCreateByUser(userId)` | no "cart doesn't exist yet" special case |
| | `clear(userId, { session })` | empty the cart after checkout |
| `orderRepository` | `findByUser(userId)` | order history, newest first |
| | `findByIdForUser(id, userId, { isAdmin })` | ownership-scoped read |

## API

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | — | create an account, returns access + refresh tokens |
| POST | `/api/auth/login` | — | log in (rate-limited) |
| POST | `/api/auth/refresh` | — | exchange a refresh token for a new access token |
| POST | `/api/auth/logout` | — | invalidate the refresh token |
| GET | `/api/auth/me` | JWT | the logged-in user |
| GET | `/api/products` | — | catalogue with `?category=&minPrice=&maxPrice=&inStock=` |
| GET | `/api/products/:id` | — | one product |
| POST | `/api/products` | JWT, admin | create a product |
| PUT | `/api/products/:id` | JWT, admin | update a product |
| DELETE | `/api/products/:id` | JWT, admin | delete a product |
| GET | `/api/categories` | — | list categories |
| GET | `/api/categories/:id` | — | one category |
| POST | `/api/categories` | JWT, admin | create a category |
| PUT | `/api/categories/:id` | JWT, admin | update a category |
| DELETE | `/api/categories/:id` | JWT, admin | delete a category |
| GET | `/api/cart` | JWT | the user's cart + totals |
| POST | `/api/cart/items` | JWT | add `{ productId, quantity }` |
| PUT | `/api/cart/items/:productId` | JWT | update quantity |
| DELETE | `/api/cart/items` | JWT | remove `{ productId }` |
| POST | `/api/orders` | JWT | checkout (decrements stock, clears the cart) |
| GET | `/api/orders` | JWT | my orders, newest first |
| GET | `/api/orders/:id` | JWT | owner or admin only |
| PUT | `/api/orders/:id/status` | JWT, admin | update fulfilment status |

## Errors

Throw or forward an `AppError`; the global handler turns it into a
consistent JSON body. Both styles work:

```js
next(new AppError('No product found with that ID.', 404));
next(AppError.notFound('No product found with that ID.'));
```

Mongoose `CastError` (400), duplicate key (409) and `ValidationError` (400),
plus JWT errors (401), are translated automatically in
`middleware/errorHandler.js`.

Wrap every async controller in `catchAsync` so rejections reach that handler.

## Environment variables

See `.env.example`. `MONGO_URI` and `JWT_SECRET` are required;
`JWT_REFRESH_SECRET` falls back to `JWT_SECRET` when unset. Copy
`.env.example` to `.env` and fill in real values — `.env` is gitignored and
must never be committed.
