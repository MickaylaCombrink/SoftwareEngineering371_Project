# Software Testing Report

SEN371 Software Engineering Project — Perfume E-commerce Platform ("Scent")
Test Reporting with Coverage Analysis (Milestone 5)

## 1. Test Strategy Overview

The project follows a **test-with-implementation** approach across the stack:

| Layer       | Framework           | Entry point        |
|-------------|---------------------|--------------------|
| Backend     | Jest + Supertest + mongodb-memory-server | `npm test` (root)  |
| Frontend    | Vitest + React Testing Library + jsdom   | `npm test` (client)|

All tests run in CI-friendly isolation:
- **Backend**: in-memory MongoDB (`mongodb-memory-server`), no live database required.
- **Frontend**: `jsdom` environment; API and context dependencies are mocked per suite.

## 2. Test Types Delivered

### 2.1 Unit Testing (Backend + Frontend)
- Utilities: `formatZAR` currency formatting (5 tests, 100% coverage).
- Token store helpers: `setTokens`, `clearTokens`, `getRefreshToken` in `src/api/axios.js`.
- Axios request interceptor verifies the `Authorization: Bearer` header is attached (and omitted when no token is set).
- Backend: validation helpers and error paths exercised through controllers/services.

### 2.2 Component Testing (Frontend)
React Testing Library, rendering components in isolation with mocked contexts and the router:

- `ProductCard` — name/price rendering, detail link, in-stock vs out-of-stock states, add-to-cart behavior, login prompt for guests.
- `Navbar` — guest vs authenticated nav, admin-only link, cart badge count.
- `CartItem` — quantity increment/decrement, remove with toast feedback, error toasts.
- `ProtectedRoute` / `AdminRoute` — role-based access and loading spinners.
- `Footer` — brand, navigation groups and copyright rendering.
- `Login` / `Register` — field rendering, submit payloads, password mismatch guard, success/error toasts.
- `Cart`, `Products`, `Home`, `Orders`, `Checkout`, `OrderDetail`, `ProductDetail`, `AdminDashboard`, `Profile`, `NotFound` — page-level rendering, loading states, empty states, and redirects.
- `Profile` — includes the **Change Password** flow: calls `PUT /api/auth/change-password`, rejects mismatched confirmations without an API call, and signs the user out on success.

### 2.3 Function Testing (Contexts & Hooks)
- `AuthContext` — session restore from `localStorage`, login persistence, logout cleanup, admin detection.
- `CartContext` — cart fetch on mount, add/update/remove dispatches reflect new state.
- `useProducts` / `useOrders` hooks — API parameter mapping, error surfacing, loading state.

### 2.4 Backend Integration Testing (API)
91 tests across 6 suites covering the full REST contract:

- **Auth** — registration, login, refresh-token rotation, logout, protected `/auth/me`,
  **change-password** (wrong current password → 401, short new password → 400, happy path
  flips which password logs in, and the user's refresh tokens are revoked).
- **Products** — catalogue list with filters, single product, admin-only writes.
- **Categories** — CRUD, admin guards, duplicate handling.
- **Cart** — add/update/remove with stock bounds enforced server-side.
- **Orders** (11 tests) — checkout saga with stock decrement + compensation rollback, ownership scoping (`403`), admin read-all, admin status updates (`Pending` → `Shipping` → `Delivered`).

### 2.5 User Testing
Automated user-flow tests simulate the acceptance journeys:

1. Browse catalogue → filter by category/price → view product.
2. Register → log in → add to cart → update quantity → checkout → view order.
3. Admin: log in → view all orders → update order status.
4. Unauthenticated guard: protected routes redirect to `/login`.

## 3. Notable Defects Found & Fixed

| Defect | Where | Found by | Fix |
|--------|-------|----------|-----|
| Checkout called `POST /orders/checkout` but the backend route is `POST /orders` — every checkout 404'd | `Checkout.jsx` | manual contract trace | Changed endpoint to `/orders` + updated test |
| Cart state crashed the Cart page | `CartContext.jsx` reducer | CartContext component test | Reducer reads `payload.data.cart.items` (matched API shape) |
| Backend Jest picked up frontend suites and failed | root `package.json` | full-suite run | Added `testMatch: tests/**/*.test.js` |
| Admin "all orders" endpoint missing | backend | frontend Admin dashboard planning | Added `GET /api/orders/all` (admin-only) with tests |
| Password fields had no accessible labels | `Login/Register/Profile` | Testing Library `getByLabelText` | Added `htmlFor`/`id` (a11y + testability) |

## 4. Coverage Analysis

### 4.1 Backend (Jest, `--coverage`)

| Area           | Stmts | Branch | Funcs | Lines |
|----------------|-------|--------|-------|-------|
| **All files**  | 75.54 | 63.60  | 75.17 | 76.46 |
| controllers    | 94.55 | 85.39  | 94.44 | 94.41 |
| middleware     | 88.75 | 75.00  | 86.66 | 88.88 |
| services       | 86.59 | 68.18  | 89.47 | 86.31 |
| models         | 100   | 100    | 100   | 100   |
| repositories   | 83.45 | 71.26  | 84.37 | 90.35 |
| routes         | 100   | 100    | 100   | 100   |
| utils          | 100   | 12.50  | 100   | 100   |
| config (jwt)   | 38.46 | 23.07  | 50.00 | 38.46 |
| scripts        | 0     | 0      | 0     | 0     |

Interpretation: core business logic (controllers/services) is well covered (>86% lines). The low `src/config` figure reflects JWT sign/verify helpers exercised indirectly. `src/scripts` (seed + admin-password reset) are deliberately not unit-tested — they are one-shot data utilities whose output is verified by the integration suite and the live seed run.

### 4.2 Frontend (Vitest + @vitest/coverage-v8)

| Area           | Stmts | Branch | Funcs | Lines |
|----------------|-------|--------|-------|-------|
| **All files**  | 80.56 | 63.63  | 73.38 | 82.39 |
| components     | 77.41 | 70.45  | 60.00 | 78.33 |
| context        | 68.00 | 59.09  | 72.22 | 70.10 |
| hooks          | 100   | 77.77  | 100   | 100   |
| pages          | 85.31 | 62.06  | 75.94 | 88.59 |
| utils          | 100   | 100    | 100   | 100   |
| api (axios)    | 53.57 | 27.27  | 71.42 | 55.55 |

Interpretation: every page and component is exercised through at least one positive path and the main negative branches (error/empty/unauthenticated). The `api/axios` interceptor's silent-refresh branch (lines 37–55) is only partially covered because the full 401→refresh→retry cycle requires an end-to-end server; the guard logic is still asserted via the token helpers test.

## 5. Running the Suite

```bash
# Backend (integration tests + coverage)
npm test                     # jest --coverage

# Frontend (unit/component/function tests)
cd client
npm test                     # vitest run
npm run test:coverage        # + HTML coverage report (client/coverage/)
```

## 6. Summary

- **179 tests total** (91 backend + 88 frontend), all passing.
- Backend line coverage **76.46%**, frontend line coverage **82.39%**.
- Two production bugs (checkout 404, cart crash) caught before deployment, plus a flaky
  admin-dashboard loading test fixed during the coverage pass.
- Additional deliverable: `PUT /api/auth/change-password` + Profile UI, covered end-to-end.
- Coverage output available as text + HTML (V8) per suite for the presentation.