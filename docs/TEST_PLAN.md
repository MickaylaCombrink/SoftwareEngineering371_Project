# SEN371 — Test Plan

Scentigue online perfume store · Milestone 5

---

## 1. Purpose and scope

This plan covers how the Scentigue application is tested, what each layer of
testing is responsible for, and how results are reported.

**In scope:** the Express/MongoDB API, the React client, and the journeys a
customer or administrator takes through them.

**Out of scope:** MongoDB Atlas itself, third-party libraries, and real payment
processing (the gateway is simulated — see section 6).

---

## 2. Test strategy

Five layers, each answering a different question. A behaviour is tested at the
cheapest layer that can prove it, and **not repeated higher up**.

| Layer | Question it answers | Tool | Where |
|---|---|---|---|
| Unit | Does this function do the right thing in isolation? | Jest / Vitest | `tests/*.unit.test.js`, `client/src/**/*.test.js` |
| Component | Does this module behave correctly with its immediate collaborators? | Vitest + Testing Library | `client/src/**/*.test.jsx` |
| Integration | Does an HTTP request produce the right database effect and response? | Jest + Supertest + mongodb-memory-server | `tests/*.integration.test.js` |
| Function (E2E) | Can a user complete the journey in a real browser? | Playwright | `client/tests/e2e/*.spec.js` |
| User (UAT) | Can a real person complete the journey unaided? | Scripted sessions | `docs/UAT_SCRIPT.md` |

### Why the pyramid is shaped this way

Unit and integration tests carry the weight because they are fast and precise.
End-to-end tests are deliberately few — they are slow and brittle — and are
reserved for journeys where the *integration between layers* is the risk, such
as checkout, where a payment result and a stock check must agree.

---

## 3. Test-driven development

Two changes in this milestone were written test-first, and the failing run was
kept as evidence:

**`catchAsync` did not catch synchronous throws.** A unit test asserting that a
handler throwing synchronously reaches `next()` failed:

```
● catchAsync › a synchronous throw is caught too
  Expected number of calls: 1
  Received number of calls: 0
```

The implementation invoked the handler *before* the promise chain, so a
synchronous throw escaped to Express. The fix moved the call inside
`.then()`. The test then passed with no change to the assertion.

**The admin order listing.** `GET /api/orders/all` was specified as tests first
— an admin sees every order, a customer gets 403, `GET /api/orders` still
returns only the caller's own, and `all` is not parsed as an order id — before
the route, controller, service and repository methods existed.

---

## 4. What each layer covers

### 4.1 Unit tests

No database, no HTTP, no DOM. Collaborators are replaced with mocks.

- **`AppError`** — status classification, the operational flag, factory methods
- **`catchAsync`** — async rejection, sync throw, the happy path
- **`orderService`** — the checkout saga with all three repositories mocked,
  including the compensating rollback, which is impractical to force through
  the HTTP layer
- **`payment.js`** — Luhn check digit, expiry boundaries, CVV length by brand,
  card formatting, and that the card number never appears in the result
- **`format.js`** — currency, delivery threshold, order references, date
  handling with absent values
- **`api/client.js`** — URL normalisation, the refresh-and-retry rule, and that
  concurrent 401s share one refresh

### 4.2 Component tests

Real components rendered into a real DOM, driven through the accessibility tree
as a user would.

- **`ProductCard`** — price and stock rendering, add-to-cart, the disabled
  state, and error surfacing
- **`ProductImage`** — the fallback when an image 404s
- **`ConfirmDialog`** — that a destructive action needs confirmation, keyboard
  dismissal, and the busy state
- **`AdminRoute`** — that each auth state routes to the right place, including
  doing nothing while the session is still loading

### 4.3 Integration tests

The API exercised over HTTP against an in-memory MongoDB, asserting on both the
response and the resulting database state. Organised by resource, plus one
suite for the centralised error handlers.

### 4.4 Function tests (E2E)

Playwright drives the built bundle in Chromium. The network is stubbed so the
specs are deterministic and need no running backend, but the application code,
routing, and rendering are entirely real.

### 4.5 User testing

See `docs/UAT_SCRIPT.md` — tasks, success criteria and an observation sheet for
sessions with real participants.

---

## 5. Running the tests

```bash
# Backend — from the project root
npm test                  # all backend tests
npm run test:unit         # unit only, no database needed
npm run test:integration  # API integration
npm run test:coverage     # with coverage and thresholds

# Client — from client/
npm test                  # unit + component
npm run test:coverage     # with coverage and thresholds
npm run test:e2e          # Playwright journeys
npm run test:all          # coverage then E2E
```

The integration suite downloads a MongoDB binary on first run, so the first
`npm test` needs internet access.

---

## 6. Known limitations

- **Payment is simulated.** No gateway is contacted and no card is charged.
  Tests assert the simulation's own rules, not a real provider's.
- **Delivery fees are presentational.** The API charges for items only, so no
  test asserts a delivery fee server-side.
- **Coverage of presentational pages is low by design.** Pages are covered by
  the E2E journeys rather than by shallow render assertions; see
  `docs/TEST_REPORT.md` section 3 for the reasoning and the numbers.
- **No load or security testing.** Out of scope for this milestone.
