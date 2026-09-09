# SofT Scent — Perfume E-Commerce Platform

A full-stack perfume boutique for **SEN371, Milestone 2–5**: an Express + MongoDB REST API
(backend) and a React SPA (frontend). Includes a real product catalogue with photography,
JWT authentication, role-based admin, cart, checkout, order tracking, and a full automated
test suite (192 tests, ~80% line coverage).

```
backend   Express + MongoDB  ──►  http://localhost:5000/api
frontend  React + Vite + Tailwind ──►  http://localhost:5173
```

## Repository layout

```
src/                 express backend (see "Backend architecture")
tests/               backend integration tests (Jest + Supertest)
client/              React frontend
  src/api/           axios client with token refresh
  src/context/       AuthContext, CartContext
  src/components/    Navbar, Footer, ProductCard, filters, route guards
  src/pages/         Home, Products, Product Detail, Cart, Checkout, Orders, ...
  src/hooks/         useProducts, useOrders
  public/images/     real product photography used by the catalogue
docs/                runbook, admin guide, presentation deck & demo script
render.yaml          Render blueprint (backend + static site)
client/vercel.json   Vercel SPA rewrites
TESTING.md           full test report (Milestone 5)
```

## Quick start

Requirements: **Node 18+**, MongoDB (local or Atlas). Optionally seed an admin.

```bash
# 1. install everything
npm install
cd client && npm install && cd ..

# 2. configure environment (see .env.example — never commit real secrets)
cp .env.example .env           # fill in MONGO_URI, JWT_SECRET

# 3. populate the database with the 41-product catalogue + 7 categories
npm run seed                   # idempotent: no-ops if data exists
npm run seed -- --fresh        # wipe products/categories and reseed

# 4. run the API (port 5000)
npm run dev                    # nodemon, hot reload

# 5. in a second terminal, run the client (port 5173, proxies /api -> 5000)
cd client
npm run dev
```

Open http://localhost:5173. Log in as the admin (see below) to manage the shop, or
register as a customer to shop, check out and track orders.

### The default admin

`npm run seed` creates the first administrator — **your only way to get the admin role**
(registration always creates a `customer`).

```bash
npm run seed                     # creates or promotes: admin@ecommerce.local / ChangeMe123!
npm run seed -- --fresh          # same, before the fresh catalogue load
```

The seed never resets an existing admin password. Change it immediately after first login
**from inside the app**: Profile → Change Password (see `docs/CHANGING_ADMIN_PASSWORD.md`).

## Scripts

### Backend (`package.json`)

| Command                 | Purpose                                        |
|-------------------------|------------------------------------------------|
| `npm run dev`           | nodemon on `src/server.js` (port 5000)         |
| `npm start`             | plain `node src/server.js`                     |
| `npm test`              | Jest + Supertest, coverage, in-memory MongoDB  |
| `npm run lint`          | ESLint over `src` and `tests`                  |
| `npm run seed`          | idempotent catalogue + admin seed              |
| `npm run seed -- --fresh` | wipe products/categories, reseed everything  |

Environment: see `.env.example`. **`.env` is gitignored and must never be committed.**

### Frontend (`client/package.json`)

| Command                 | Purpose                                        |
|-------------------------|------------------------------------------------|
| `npm run dev`           | Vite dev server (port 5173, `/api` proxy)      |
| `npm run build`         | production build to `dist/`                    |
| `npm run preview`       | serve the production build locally             |
| `npm test`              | Vitest, all component/page/context tests       |
| `npm run test:coverage` | Vitest with V8 coverage                        |
| `npm run lint`          | oxlint                                         |

## Testing

- **Backend** — Jest integration tests hit a real Mongoose layer on `mongodb-memory-server`
  (no external DB needed): auth, cart, orders, products, error handling, repositories.
- **Frontend** — Vitest + Testing Library in jsdom: components, pages, contexts, hooks.
- Full report with coverage tables in **`TESTING.md`**.

```bash
npm test                   # backend
cd client && npm test      # frontend
```

## Backend architecture

**route → controller → repository → model.** Controllers own HTTP concerns (status codes,
response shape); repositories own the queries; models own the schema.

```
src/
  server.js        entry point: connects to Mongo, then listens
  app.js           Express app: middleware, route mounting, error handlers
  config/          db.js (connectDB), jwt.js (sign/verify access + refresh)
  models/          User, Product, Category, Cart, Order
  repositories/    BaseRepository + one per model (search, stock decrement, ...)
  controllers/     HTTP concerns only
  routes/          route tables, auth guards applied here
  middleware/      notFound, errorHandler, auth (protect/restrictTo), rate limiting
  scripts/         seed.js — catalogue + admin seeder
  utils/           AppError, catchAsync
tests/             integration tests
```

Notable conventions:

- Repositories return `null` for "not found" instead of throwing; controllers turn that into
  a 404 via `AppError`.
- Atomic stock decrement (`productRepository.decrementStock`) refuses to oversell.
- Passwords are bcrypt-hashed (12 rounds); the hash is `select: false` by default and never
  serialised.
- Refresh tokens live in an in-memory allow-list keyed by user id (deliberately simple for a
  module project; swap for a Redis/DB store in production). Changing your password revokes
  every refresh token you hold.
- Login is rate-limited; every auth route has a broad rate-limit ceiling.
- The frontend axios layer refreshes tokens on a 401 and retries the original request.

## API summary

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | — | create account, returns access + refresh tokens |
| POST | `/api/auth/login` | — | log in (rate-limited) |
| POST | `/api/auth/refresh` | — | exchange refresh token for a new access token |
| POST | `/api/auth/logout` | — | invalidate the refresh token |
| GET | `/api/auth/me` | JWT | the logged-in user |
| PUT | `/api/auth/change-password` | JWT | change password, revokes your refresh tokens |
| GET | `/api/products` | — | catalogue: `?category=&minPrice=&maxPrice=&inStock=&search=` |
| GET | `/api/products/:id` | — | one product |
| POST | `/api/products` | admin | create a product |
| PUT | `/api/products/:id` | admin | update a product |
| DELETE | `/api/products/:id` | admin | delete a product |
| GET | `/api/categories` | — | list categories |
| GET | `/api/categories/:id` | — | one category |
| POST | `/api/categories` | admin | create a category |
| PUT | `/api/categories/:id` | admin | update a category |
| DELETE | `/api/categories/:id` | admin | delete a category |
| GET | `/api/cart` | JWT | the user's cart + totals |
| POST | `/api/cart/items` | JWT | add `{ productId, quantity }` |
| PUT | `/api/cart/items/:productId` | JWT | update quantity |
| DELETE | `/api/cart/items` | JWT | remove `{ productId }` |
| POST | `/api/orders` | JWT | checkout (decrements stock, clears the cart) — **not `/orders/checkout`** |
| GET | `/api/orders` | JWT | my orders, newest first |
| GET | `/api/orders/:id` | JWT | owner or admin only |
| GET | `/api/orders/all` | admin | every order in the shop |
| PUT | `/api/orders/:id/status` | admin | update fulfilment status |

## Deployment

Configuration is ready but **not yet deployed** — the repo must not be pushed to a public
remote until the exposed Atlas credential in git history has been rotated. See:

- **`docs/RUNBOOK.md`** — step-by-step deploy to Render (API + static site) and the Vercel
  alternative, including every environment variable to set.
- **`render.yaml`** (Render Blueprint) and **`client/vercel.json`** (SPA rewrites).

## Documentation

- `docs/RUNBOOK.md` — everyday operations: run, reseed, test, deploy, troubleshoot.
- `docs/CHANGING_ADMIN_PASSWORD.md` — how to change the admin login (in-app and emergency reset).
- `docs/presentation/DECK.md` — Milestone 5 slide deck with speaker notes.
- `docs/presentation/DEMO_SCRIPT.md` — narrated, timed walkthrough of the live app.
- `TESTING.md` — test strategy, coverage tables, defect log.
- `HANDOVER.md` — per-person breakdown from earlier milestones.