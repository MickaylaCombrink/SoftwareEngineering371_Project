# Client (front end)

PERSON 3 — React front end for the SEN371 store.

A minimal Vite + React scaffold is in place: it fetches `GET /api/products`
and lists them, which proves the API base URL, CORS and the response shape
all line up. The real UI is built on top of this.

## Running it

```bash
cd client
npm install
cp .env.example .env      # optional; the default points at localhost:5000
npm run dev               # http://localhost:5173
```

The backend must be running and seeded first, from the project root:

```bash
npm run dev
npm run seed
```

## What is here

```
index.html
vite.config.js       dev server on 5173 (matches the backend's CLIENT_ORIGIN)
src/
  main.jsx           React entry point
  App.jsx            placeholder product list — replace with the real UI
  api.js             fetch wrapper: unwraps { status, data }, throws on failure,
                     sends the Bearer token once setAccessToken() is called
  index.css
```

`src/api.js` already has `getProducts`, `getCategories`, `login` and
`getCart`. Add cart mutations there rather than calling `fetch` from
components.

`client/dist/` and `client/node_modules/` are covered by the root
`.gitignore`.
