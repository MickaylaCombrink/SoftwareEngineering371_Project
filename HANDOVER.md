# Milestone 2 — who owns what

All four personas' deliverables are implemented and the test suite is
green (5 suites, 52 tests). Anything previously marked TO BUILD has been
completed; the sections below record where each piece lives.

---

## Person 1 — Project Skeleton and Database — DONE

| Deliverable | Where |
|---|---|
| Folder structure | one `src/` tree, `tests/` beside it |
| Express app bootstrap | `src/app.js`, `src/server.js` |
| Database connection | `src/config/db.js` — cached single connection, `connectDB()` / `disconnectDB()` |
| Base repository | `src/repositories/BaseRepository.js` |
| Five schemas + indexes | `src/models/` — 11 explicit `schema.index(...)` declarations |

The per-model repositories (`ProductRepository`, `CategoryRepository`,
`CartRepository`, `OrderRepository`, `UserRepository`) extend
`BaseRepository`. Checkout also relies on
`ProductRepository.decrementStock()` (atomic, refuses to oversell) and its
compensating `incrementStock()` for rollback.

## Person 2 — Login and Security — DONE

| Deliverable | Where |
|---|---|
| JWT sign/verify | `src/config/jwt.js` — access + refresh tokens, separate secrets |
| Auth middleware | `src/middleware/auth.js` — `protect`, `restrictTo(...roles)` |
| Auth controller | `src/controllers/authController.js` — register, login, refresh, logout, getMe |
| Routes | `src/routes/authRoutes.js`, mounted at `/api/auth` in `src/app.js` |
| Rate limiting | `express-rate-limit` on `/api/auth` in `src/app.js` |
| Password hashing | `bcryptjs` at cost 12; the raw password is length-validated (min 8) before hashing |

Security behaviour covered by the tests: same 401 message for unknown
email and wrong password (no enumeration), hashed storage with
`select: false`, expired/bad tokens -> 401, logout invalidates the refresh
token allow-list, and `restrictTo('admin')` is restored on the product and
category write routes.

## Person 3 — Shopping Cart API — DONE

| Deliverable | Where |
|---|---|
| Business rules | `src/services/cartService.js` — add, change quantity, remove, totals |
| Controller | `src/controllers/cartController.js` |
| Routes | `src/routes/cartRoutes.js`, mounted at `/api/cart` (all behind `protect`) |

Cart rules from the plan: quantity above stock -> 422 with the cart
unchanged; the same product added twice combines into one line item;
totals are `unitPrice * quantity` summed. `cartRepository.findOrCreateByUser`
removes the "no cart yet" special case.

## Person 4 — Error Handling and Categories — DONE

| Deliverable | Where |
|---|---|
| Error classes | `src/utils/AppError.js` (+ `src/utils/catchAsync.js`) |
| Central error handler | `src/middleware/errorHandler.js`, `src/middleware/notFound.js` |
| Categories API | `src/controllers/categoryController.js`, `src/routes/categoryRoutes.js` |
| Seed script | `src/scripts/seed.js` — `npm run seed` |

`npm run seed` inserts 5 categories and 14 products (2 deliberately out of
stock, so the `?inStock=true` filter and the "quantity exceeds stock -> 422"
path have something to hit). `npm run seed -- --fresh` wipes and reseeds;
`-- --drop` just wipes. It refuses to run when `NODE_ENV=production`.

Tests: `tests/errorHandling.integration.test.js` covers the error handler
and the Categories API.

---

## Unassigned — Orders — DONE (picked up)

| Deliverable | Where |
|---|---|
| Service | `src/services/orderService.js` — checkout, history, ownership-scoped read, admin status update |
| Controller | `src/controllers/orderController.js` |
| Routes | `src/routes/orderRoutes.js`, mounted at `/api/orders` |

Checkout uses a compensation (saga) flow: stock is decremented atomically
per line, the order snapshot is written, the cart is cleared, and any
failure after a decrement restores that stock — so a failed checkout never
consumes inventory or partial-commits an order. Line items carry a
`unitPrice` snapshot so later price changes never alter historic orders.
`GET /api/orders/:id` returns 403 for non-owners without leaking whether an
order id exists.

## Complete and verified

- `npm test` — 5 suites / 52 tests passing (in-memory MongoDB)
- `npm run lint` — 0 errors (some intentional `console` warnings in
  `server.js`, `db.js`, `seed.js`)
- `npm start` connects to the configured `MONGO_URI` (Atlas) and serves
  the API on `PORT`.

## Environment

Copy `.env.example` to `.env` and fill in real values. `.env` is
gitignored — never commit real secrets to `.env.example` either. The
JWT access and refresh secrets should be two distinct random strings of
at least 32 bytes per the deployment plan.