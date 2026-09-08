# RUNBOOK — Scent Perfume E-Commerce

Operations guide for the team and the module assessor. Covers everyday commands,
reseeding, testing, troubleshooting and deployment.

---

## 1. Running the app locally

Two processes, in two terminals.

### Terminal 1 — backend

```bash
# project root
npm install
cp .env.example .env      # first time: fill in MONGO_URI, JWT_SECRET
npm run dev               # nodemon on http://localhost:5000
```

Sanity checks:

```bash
# health check
Invoke-WebRequest http://localhost:5000/api/health      # PowerShell
curl http://localhost:5000/api/health                   # Git Bash / WSL
# catalogue
curl http://localhost:5000/api/products                 # expects 41 products
```

### Terminal 2 — frontend

```bash
cd client
npm install
npm run dev               # http://localhost:5173 (proxies /api -> 5000)
```

> The client does not need its own `.env` locally — Vite proxies `/api` to the backend.
> Set `VITE_API_BASE_URL` only when the frontend talks to a deployed API.

---

## 2. Reseeding the database

The seed is **idempotent**: if categories already exist it does nothing unless you pass
`--fresh`.

```bash
npm run seed                # no-op if data exists; creates/promotes the admin
npm run seed -- --fresh     # delete products & categories, reload 41 products + 7 categories
npm run seed -- --drop      # just wipe products & categories, do not reseed
```

**What the seed does and does not touch**

| Object        | Behaviour                                                     |
|---------------|---------------------------------------------------------------|
| Products      | wiped under `--fresh`, reloaded from `src/scripts/seed.js`     |
| Categories    | wiped under `--fresh`, reloaded                              |
| Users         | **never deleted**                                               |
| Orders        | **never deleted**                                               |
| Admin user    | created once if missing; **existing admin password is never reset** |

Current catalogue: 41 photography-backed products in 7 families — Oud, Gourmand, Amber,
Floral, Woody, Oriental, Fresh. Product images are served from `client/public/images/`.

---

## 3. Admin account (getting the role)

Registration never grants `admin`; the seed is the only path.

```bash
npm run seed
# default admin: admin@ecommerce.local / ChangeMe123!
```

**Change the password right away** (in-app): log in → *My Profile* → *Change Password*.
Full guide in `docs/CHANGING_ADMIN_PASSWORD.md`.

---

## 4. Testing

```bash
# backend — Jest, in-memory MongoDB, coverage printed
npm test

# frontend — Vitest, jsdom
cd client && npm test

# frontend lint
cd client && npm run lint
```

Coverage reports:
- Backend: jest prints a table; also under `coverage/` (Istanbul).
- Frontend: `cd client && npm run test:coverage` (V8 text + HTML in `client/coverage/`).

Current status: backend 91 tests / 6 suites; frontend 88 tests / 23 suites (see `TESTING.md`).

---

## 5. Common troubleshooting

| Symptom | Cause / fix |
|---|---|
| `EADDRINUSE :::5000` | Backend already running (check with `netstat -ano \| findstr :5000`); stop it or change `PORT` in `.env`. |
| Client shows products with no photos | Old seed — run `npm run seed -- --fresh`. Confirm `client/public/images/*.webp` exists. |
| Checkout returns 404 | Frontend must call **`POST /api/orders`**, not `/orders/checkout` (fixed in `Checkout.jsx`). |
| Login gives 401 repeatedly | Wrong password; the admin password is only set at first seed. Reset it — `docs/CHANGING_ADMIN_PASSWORD.md`. |
| `npm test` in root picks up client files | Jest `testMatch` is restricted to `tests/**/*.test.js`; if someone removes it, restore it. |
| Images broken after deploying | The deployed static host must serve the `client/public/images/` folder (it is included in the build by Vite). |
| Can't connect to Atlas | `MONGO_URI` invalid, or the DB user password was rotated (see `PRODUCTION` section) and `.env` not updated. |

---

## 6. Production deployment

Ready-made config, **not yet deployed** to a remote. The team must first rotate the exposed
Atlas database password (see §7), then choose one of the two routes below.

### Route A — Render (blueprint included)

`render.yaml` defines two services:

1. **`scent-api`** — Node service, `npm start`, health check `GET /api/health`.
2. **`scent-client`** — static site serving `client/dist`.

Steps:
1. Push to GitHub **as a private repo** (see §7 before pushing).
2. In [render.com](https://render.com) → *New* → *Blueprint* → pick the repo.
3. For the API service set env vars:

   | Variable | Value |
   |---|---|
   | `MONGO_URI` | fresh Atlas URI for the deployment-only DB user |
   | `JWT_SECRET` | 32+ byte random string |
   | `JWT_REFRESH_SECRET` | a different 32+ byte random string |
   | `CLIENT_ORIGIN` | the client's Render URL (`https://scent-client.onrender.com`) |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | only needed if you want the seed to create an admin later |

4. Add `python3` build step for the static service (`npm run build`) — the blueprint's
   `buildCommand` handles it.
5. Point the client at the deployed API via `VITE_API_BASE_URL=https://scent-api.onrender.com/api`
   (Render env var) or a `client/.env.production`.

### Route B — Vercel (already configured for SPA)

`client/vercel.json` rewrites all unknown routes to `index.html` so React Router works.
Backend still needs a host (Render/Atlas + Node service).

1. Deploy the frontend: push `client/` to a Vercel project (root = `client`, build `npm run build`).
2. Set `VITE_API_BASE_URL` to the deployed API.
3. Host the backend separately and connect the two with CORS.

### Post-deploy checklist

- [ ] `https://<api>/api/health` returns 200.
- [ ] Home page shows the hero and product photography.
- [ ] Register a customer, add to cart, checkout → order appears in *My Orders*.
- [ ] Admin can open the dashboard, see orders, and flip a status.
- [ ] Login rate limiting and JWT refresh still work over HTTPS.

---

## 7. SECURITY — rotate the exposed Atlas credential first

>`f9f1f70` (in remote history on branch `Nkosinathi`) contains a real Atlas connection string
>with password. **Do not push the repo anywhere public until this is handled.**

Recommended actions, in order:

1. **MongoDB Atlas → Database Access → edit the DB user → change/copy the new password.**
2. If you need a fresh string: create a **new DB user** with a new password and grant it read/write on the project DB, then delete the old user.
3. Update the local (gitignored) `.env` with the new `MONGO_URI`.
4. Keep this GitHub repo **private**. The old password still exists in history even after
   rotation; a private repo limits who can read it. If it must be public, rewrite history
   with `git filter-repo` (or at minimum `git rebase --root -i` + `git push --force`) **and** rotate the password anyway.

Never commit secrets: `.env` is gitignored; `.env.example` contains placeholders only.