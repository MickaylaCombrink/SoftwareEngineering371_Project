# Milestone 2 — who owns what

The skeleton, the database layer and the error handling are in place.
The auth and cart features are deliberately **not** written — they are
Person 2's and Person 3's work.

Anything below marked TODO in the code names its owner.

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
`CartRepository`, `OrderRepository`, `UserRepository`) are also here and
extend `BaseRepository`. Person 2 and Person 3 can use theirs as-is or
extend them.

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

## Person 2 — Login and Security — TO BUILD

The files exist but are **empty stubs** — each one has a header comment
listing what it must export and which test cases it has to satisfy:

- `src/config/jwt.js`
- `src/middleware/auth.js`
- `src/controllers/authController.js`
- `src/routes/authRoutes.js`
- `tests/auth.integration.test.js` (12 `test.todo` entries)

What the rest of the code expects you to create:

- `src/config/jwt.js` — sign and verify access + refresh tokens.
  `.env.example` already declares `JWT_SECRET`, `JWT_EXPIRES_IN`,
  `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`.
- `src/controllers/authController.js` — register, login, refresh, logout.
  Password hashing with `bcryptjs` (already a dependency).
- `src/middleware/auth.js` — must export `protect` and `restrictTo(...roles)`.
  Those exact names are referenced in the TODOs in `productRoutes.js` and
  `categoryRoutes.js`.
- `src/routes/authRoutes.js` — then uncomment the `/api/auth` mount in
  `src/app.js`.
- Rate limiting on login (`express-rate-limit`), marked with a TODO in
  `src/app.js`.

Already there for you: the `User` schema (with `password` set to
`select: false`, an 8-character minimum and a unique email index) and
`UserRepository`, which has `findByEmailWithPassword()` for the login path
and `emailExists()` for the duplicate-registration 409.

**Until this lands, the admin-only product and category write endpoints are
unprotected.** The TODO comments in both route files say exactly which
guards to restore.

## Person 3 — Shopping Cart API — TO BUILD

The files exist but are **empty stubs**, each with a header comment
describing what belongs in it:

- `src/services/cartService.js`
- `src/controllers/cartController.js`
- `src/routes/cartRoutes.js`
- `tests/cart.integration.test.js` (10 `test.todo` entries)
- `client/` — React project, see `client/README.md`

What to create:

- `src/services/cartService.js` — add item, change quantity, remove item,
  calculate totals.
- `src/controllers/cartController.js` and `src/routes/cartRoutes.js` — then
  uncomment the `/api/cart` mount in `src/app.js`.
- Tests.

Already there for you: the `Cart` schema (embedded `cartItemSchema`, one
cart per user via a unique `userId` index) and `CartRepository`, which has
`findOrCreateByUser()` and `clear()`. The cart routes will need Person 2's
`protect` middleware.

---

## Unassigned — Orders

`Order` schema and `OrderRepository` exist. `src/services/orderService.js`,
`src/controllers/orderController.js`, `src/routes/orderRoutes.js` and
`tests/order.integration.test.js` are empty stubs. Orders depend on both
auth and the cart, and no brief covers them — someone needs to pick this up. `ProductRepository.decrementStock()` is
already written for checkout: it is atomic and refuses to oversell.

## Also outstanding

- **No git repository.** `git init`, commit, push.
- No `.env` — copy `.env.example` and fill in `MONGO_URI` and `JWT_SECRET`.

---

## A note on the stub files

Every file listed as "TO BUILD" exists and is committed, so the folder
structure is complete and the repository shows the full shape of the
project. They export nothing — `module.exports = {}` — apart from the route
files, which export an empty Express router.

The `/api/auth`, `/api/cart` and `/api/orders` mounts in `src/app.js` stay
commented out until the handlers behind them are real. Uncommenting a mount
before its controller has handlers will crash the app on boot.

`npm test` passes on the current tree: the unbuilt suites are `test.todo`
entries, which jest reports as pending rather than failing.
