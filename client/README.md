# Client - React front end

Vite + React. The shared API layer lives in `src/api` and is what every
other screen calls; nobody should call `fetch` directly.

## Running it

```bash
cd client
npm install
cp .env.example .env      # optional, the default points at localhost:5000
npm run dev               # http://localhost:5173
```

The backend must be running and seeded first, from the repository root:

```bash
npm run seed
npm run dev               # API on :5000
```

## Layout

```
index.html
vite.config.js            dev server on 5173, matching the backend CLIENT_ORIGIN
src/
  main.jsx                entry point
  App.jsx
  index.css
  api/
    client.js             fetch wrapper: auth header, envelope, refresh, retry
    endpoints.js          the typed API surface - call these, not fetch
    tokenStorage.js       access + refresh token persistence
  components/             Spinner, ErrorBanner, EmptyState
  layout/PageLayout.jsx
  routes/AppRoutes.jsx    every route registered, placeholders where unbuilt
  utils/errorMessages.js  status-code fallback copy
```

## The API surface

Every method returns a promise. Failures throw an `ApiError` carrying
`message` (the server's own wording where it sent one), `status` and `body`,
so a screen can render `err.message` directly.

```js
import { AuthAPI, ProductsAPI, CategoriesAPI, CartAPI, OrdersAPI } from './api/endpoints';

AuthAPI.register({ firstName, lastName, email, password })  // -> user
AuthAPI.login(email, password)                              // -> user
AuthAPI.logout()                                            // -> undefined
AuthAPI.getMe()                                             // -> user

ProductsAPI.list({ category, minPrice, maxPrice, inStock, q, sort, page, limit })
                          // -> { products, results, total, page, pages }
ProductsAPI.get(id)       // -> product
ProductsAPI.create(payload) / update(id, payload) / remove(id)     // admin

CategoriesAPI.list()      // -> [category]
CategoriesAPI.get(id)     // -> category
CategoriesAPI.create(payload) / update(id, payload) / remove(id)   // admin

CartAPI.get()                            // -> { cart, itemCount, subtotal }
CartAPI.addItem(productId, quantity)     // -> { cart, itemCount, subtotal }
CartAPI.setQuantity(productId, quantity) // -> { cart, itemCount, subtotal }
CartAPI.removeItem(productId)            // -> { cart, itemCount, subtotal }

OrdersAPI.checkout()      // -> order
OrdersAPI.list()          // -> [order]
OrdersAPI.get(id)         // -> order
OrdersAPI.setStatus(id, orderStatus)                               // admin
```

`sort` accepts `newest`, `oldest`, `price-asc`, `price-desc`, `name`. Anything
else is a 400 from the API.

## How the client handles auth

- The access token goes on every request as `Authorization: Bearer …`.
- A 401 triggers one call to `/api/auth/refresh`, then the original request is
  retried exactly once. If the refresh also fails, tokens are cleared and
  `onAuthFailure` runs (by default, a redirect to `/login`).
- **The backend rotates refresh tokens.** Each refresh returns a new one and
  revokes the old, so the client overwrites both on every refresh. Failing to
  store the new one makes the next refresh 401.
- Concurrent 401s share a single refresh call rather than firing several.
- Login and register deliberately skip all of this: a 401 there means a wrong
  password, not an expired session.

Person 2 can replace the redirect with in-app navigation:

```js
import { setOnAuthFailure } from './api/client';
setOnAuthFailure(() => { /* clear auth context, navigate('/login') */ });
```

## Notes

- Paths may be written `/api/products` or `/products`; the client normalises
  them, so `VITE_API_BASE_URL` works with or without a trailing `/api`.
- Anything prefixed `VITE_` is compiled into the bundle and publicly readable.
  Never put a secret there.
- Tokens are kept in `localStorage`: simple and survives a refresh, but
  readable by any injected script. The alternative - keeping the access token
  in memory and re-authenticating on load - is safer against XSS but loses the
  session on every hard refresh. Worth stating the choice in the report.
