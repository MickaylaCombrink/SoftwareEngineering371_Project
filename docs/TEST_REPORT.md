# SEN371 — Test Report

Scentigue online perfume store · Milestone 5

---

## 1. Summary

| | Count |
|---|---|
| Backend unit tests | 25 |
| Backend integration tests | 109 |
| Client unit tests | 59 |
| Client component tests | 35 |
| End-to-end function tests | 14 |
| **Total automated tests** | **242** |

All suites pass. Coverage thresholds are enforced and fail the build if
breached.

---

## 2. Results by layer

### Backend — `npm test` (project root)

| Suite | Tests | Type |
|---|---|---|
| `appError.unit.test.js` | 9 | Unit |
| `catchAsync.unit.test.js` | 3 | Unit |
| `orderService.unit.test.js` | 13 | Unit |
| `auth.integration.test.js` | 12 | Integration |
| `cart.integration.test.js` | 10 | Integration |
| `category.integration.test.js` | 14 | Integration |
| `errorHandling.integration.test.js` | 6 | Integration |
| `order.integration.test.js` | 15 | Integration |
| `product.integration.test.js` | 32 | Integration |
| `refreshToken.integration.test.js` | 12 | Integration |
| `repositories.integration.test.js` | 8 | Integration |

### Client — `npm test` (client/)

| Suite | Tests | Type |
|---|---|---|
| `utils/payment.test.js` | 32 | Unit |
| `utils/format.test.js` | 13 | Unit |
| `api/client.test.js` | 24 | Unit |
| `components/ProductCard.test.jsx` | 8 | Component |
| `components/ProductImage.test.jsx` | 5 | Component |
| `components/admin/ConfirmDialog.test.jsx` | 8 | Component |
| `routes/AdminRoute.test.jsx` | 4 | Component |

### End-to-end — `npm run test:e2e` (client/)

| Spec | Tests |
|---|---|
| `checkout.spec.js` | 9 |
| `admin.spec.js` | 5 |

---

## 3. Coverage analysis

### Backend

```
Functions   91.60
Branches    73.78
Lines       92.99
```

Models, routes and controllers are at or near 100%. The gaps that remain are
`config/db.js`, which the tests never call because they connect to an in-memory
server instead, and the error branches of `errorHandler.js` that only fire on a
malformed driver response.

Coverage excludes `src/api/**` and `src/utils/errorMessages.js`. Those are
leftovers from before the React client moved into `client/`; they are dead code
on the server and, while they were counted, they pulled the backend figures
down by roughly sixteen points and failed the build.

### Client

```
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|--------
All files          |   19.15 |    17.75 |   17.52 |    18.90
 api/client.js     |   98.33 |   100.00 |   96.00 |    98.18
 utils/payment.js  |  100.00 |   100.00 |  100.00 |   100.00
 utils/format.js   |  100.00 |    90.00 |  100.00 |   100.00
 ProductCard.jsx   |  100.00 |    93.75 |  100.00 |   100.00
 ProductImage.jsx  |  100.00 |    90.00 |  100.00 |   100.00
 ConfirmDialog.jsx |   93.75 |    84.21 |  100.00 |   100.00
 pages/*           |    0.00 |     0.00 |    0.00 |     0.00
```

**The headline figure is low, and that is a deliberate choice rather than an
oversight.** Coverage is concentrated where the rules live:

- Every module that makes a *decision* — payment validation, currency and
  delivery rules, URL normalisation, refresh-and-retry, the admin guard — is at
  or near 100%.
- The page components are mostly markup. Unit-testing them would mean
  asserting that a heading renders, which passes whether or not the page
  actually works. They are covered instead by the 14 Playwright journeys, which
  exercise the same code in a real browser and assert on outcomes a user cares
  about, such as whether an order was created.

A single global percentage cannot distinguish these two cases, which is why
per-file thresholds are set on the logic modules and a modest global floor
catches regressions.

### Thresholds enforced

| Scope | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| Backend, global | 80 | 70 | 80 | 80 |
| Client, global | 17 | 16 | 15 | 17 |
| `utils/payment.js` | 95 | 90 | 90 | 95 |
| `utils/format.js` | 90 | 85 | 85 | 90 |
| `api/client.js` | 85 | 75 | 85 | 85 |
| `ProductCard.jsx` | 95 | 85 | 95 | 95 |
| `ProductImage.jsx` | 95 | 85 | 95 | 95 |

HTML reports are written to `coverage/` on both sides.

---

## 4. Defects found by testing

Four defects were found by the tests written for this milestone. All are fixed.

| # | Defect | Found by | Severity |
|---|---|---|---|
| 1 | `catchAsync` did not catch synchronous throws, so a non-async handler that threw would crash the process instead of returning a 500 | Unit test | Major |
| 2 | Confirm dialog buttons were unclickable in a real browser — Bootstrap sets `pointer-events: none` on `.modal-dialog` and restores it on `.modal-content`, which the dialog did not use | E2E test | Critical |
| 3 | `/admin` was declared twice in the router, the unguarded declaration winning, so any signed-out visitor could open the admin console | E2E test | Critical |
| 4 | The admin panel displayed hardcoded figures and called no endpoint | E2E test | Major |

Defect 2 is the clearest argument for having more than one layer: the component
test passed because **jsdom does not implement `pointer-events`**. Only a real
browser could catch it.

---

## 5. User acceptance testing

Protocol, tasks and observation sheet: `docs/UAT_SCRIPT.md`.

Sessions are to be run with 5–8 participants who have not used the application.
Record results below.

| Issue | Participants affected | Severity | Action taken |
|---|---|---|---|
| *(to be completed after sessions)* | | | |

**Summary:** _to be completed_

---

## 6. Test maintenance

Nine redundant tests were removed during this milestone. `errorHandling.integration.test.js`
had grown into a second copy of the category CRUD suite — create, duplicate,
update, delete and not-found were all asserted twice, in two files, against the
same routes. It now covers only the four centralised error handlers plus the
404 and health plumbing, and each behaviour is asserted exactly once in the
codebase.

Removed:

- `create then list -> 201` (duplicate of category suite)
- `missing required description -> 400` (duplicate)
- `update a category -> 200` (duplicate)
- `delete a category -> 204` (duplicate)
- `deleting a category that does not exist -> 404` (duplicate)
- `getting a non-existent but valid ID -> 404` (duplicate of product suite)
- `an unknown /api route is also a 404` (identical to the test above it — same
  URL, same assertion)
- `a malformed id -> 400` from the category suite (kept once, in the handler suite)

---

## 7. How to reproduce these results

```bash
# Backend
npm install
npm run test:coverage

# Client
cd client
npm install
npm run test:coverage
npx playwright install chromium   # first run only
npm run test:e2e
```

The backend integration suite downloads a MongoDB binary on first run and needs
internet access for that download.

The two halves use different runners — Jest on the server, Vitest in the client
— so they must be run from their own folders. Jest is configured to ignore
`client/`, otherwise it tries to parse the Vitest and Playwright specs and fails
on the JSX and the ES module syntax it is not set up to transform.
