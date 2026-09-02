# Milestone 2 — who owns what

All four personas' deliverables are implemented. The sections below
record where each piece lives.

Run `npm test` after pulling: the suite has not been re-run since the
merge fixes listed at the bottom of this file.

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
| Rate limiting | `src/middleware/rateLimiter.js`, applied in `src/routes/authRoutes.js`: 50 requests / 15 min across `/api/auth`, and a stricter 5 / 15 min on `POST /login` (successful logins are not counted). Disabled when `NODE_ENV=test`. |
| Password hashing | `bcryptjs` at cost 12; the raw password is length-validated (min 8) before hashing |

Security behaviour covered by the tests: same 401 message for unknown
email and wrong password (no enumeration), hashed storage with
`select: false`, expired/bad tokens -> 401, logout invalidates the refresh
token allow-list, and `restrictTo('admin')` is restored on the product and
category write routes.

**Registration never grants the admin role.** A `role` in the request body
is ignored — every new account is a customer. The first administrator comes
from `npm run seed`; promote anyone else with a direct database update.

`protect` re-reads the user from the database on every request rather than
trusting the token payload, so a deleted or demoted account loses access
immediately instead of when its token expires.

## Person 3 — Shopping Cart API — DONE

| Deliverable | Where |
|---|---|
| Business rules | `src/services/cartService.js` — add, change quantity, remove, totals |
| Controller | `src/controllers/cartController.js` |
| Routes | `src/routes/cartRoutes.js`, mounted at `/api/cart` (all behind `protect`) |
| React project | `client/` — Vite + React scaffold, see `client/README.md` |

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
path have something to hit) **and creates the admin account** — without it
nothing can reach the admin-only endpoints, since registration cannot grant
that role. Credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD`, falling
back to `admin@ecommerce.local` / `ChangeMe123!`.

`npm run seed -- --fresh` wipes the catalogue and reseeds; `-- --drop` just
wipes. Neither touches users, so a wipe cannot lock you out. It refuses to
run when `NODE_ENV=production`.

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

## Merge fixes applied after the four parts landed

The merge left two implementations of several things in the same files.
Fixed:

1. `src/middleware/auth.js` had two `protect`/`restrictTo` pairs, and the
   trailing `module.exports` overwrote the good one — the version actually
   running trusted the token payload and never checked the database.
   Duplicate removed.
2. Registration accepted `role` from the request body, so anyone could
   create an admin account. Now hard-coded to `customer`; the two test
   files that relied on it promote their admin through the database
   instead.
3. `src/utils/token.js` deleted — a second copy of `config/jwt.js` reading
   `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET`, which are defined
   nowhere, so every call would have thrown. Nothing imported it.
4. Rate limiting was applied twice (an inline limiter in `app.js` on top of
   `authLimiter`), while the strict `loginLimiter` was imported and never
   used. Consolidated into `rateLimiter.js`; login now carries the tight
   limit. Limits are off under `NODE_ENV=test`, where the suite would
   otherwise trip a 429 mid-run.
5. `authRoutes.js` registered all five routes twice. Cleaned up.

## Verifying

- `npm test` — in-memory MongoDB. **Re-run this**; it has not been run
  since the fixes above.
- `npm run lint` — covers `src` and `tests` (some intentional `console`
  warnings in `server.js`, `db.js`, `seed.js`).
- `npm start` connects to the configured `MONGO_URI` and serves the API on
  `PORT`.

## First run, end to end

```bash
npm install
cp .env.example .env     # fill in MONGO_URI, JWT_SECRET, ADMIN_PASSWORD
npm run seed             # catalogue + admin account
npm run dev              # API on :5000

cd client && npm install && npm run dev   # UI on :5173
```

## Environment

Copy `.env.example` to `.env` and fill in real values. `.env` is
gitignored — never commit real secrets to `.env.example` either. The
JWT access and refresh secrets should be two distinct random strings of
at least 32 bytes per the deployment plan.