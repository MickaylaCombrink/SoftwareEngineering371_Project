# Deploying Scentigue

The API runs on **Render** and the React client on **GitHub Pages**. They are
two separate deployments on two different origins, which is why CORS and the
API base URL have to be configured deliberately.

```
Browser  ──>  https://<owner>.github.io/SoftwareEngineering371_Project/   (static files, Pages)
              │
              └── fetch ──>  https://<service>.onrender.com/api/...       (Express, Render)
                                     │
                                     └──>  MongoDB Atlas
```

---

## 0. Before anything else

- Push the project to GitHub. Nothing here can deploy from a folder.
- **Rotate the Atlas password.** The old one was committed to `.env.example`
  in the `T_API_Layer` branch and is still in the history of that repository.
  Anyone who can read the repo can read it.
- Generate two new JWT secrets and keep them out of the repository:

  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
  ```

---

## 1. The API on Render

### Create the service

1. Render dashboard → **New** → **Web Service** → connect the repository.
2. Root directory: leave blank (the API lives at the repository root).
3. Build command `npm ci`, start command `npm start`.
4. Instance type **Free**.

`render.yaml` in the repository root already carries these settings, so
"New → Blueprint" will read them instead.

### Environment variables

Set these under **Environment** in the dashboard. The ones marked *secret*
must never be committed.

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `22` |
| `MONGO_URI` | *secret* — the Atlas connection string, with the **new** password |
| `JWT_SECRET` | *secret* — 48 random bytes |
| `JWT_REFRESH_SECRET` | *secret* — a **different** 48 random bytes |
| `JWT_EXPIRES_IN` | `1d` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CLIENT_ORIGIN` | `https://<owner>.github.io,http://localhost:5173` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | *secret* — used only by the seed script |

`PORT` is **not** set by hand. Render supplies it and the server already
reads `process.env.PORT`.

`CLIENT_ORIGIN` is an origin: scheme and host only. No path, no trailing
slash — `https://mickaylacombrink.github.io`, not
`https://mickaylacombrink.github.io/SoftwareEngineering371_Project/`. Getting
this wrong is the most common cause of a working API that the site cannot
call.

The server **refuses to start** when `NODE_ENV=production` and
`CLIENT_ORIGIN` is empty. That is deliberate: a missing allow-list would
otherwise silently accept requests from any site on the internet.

### MongoDB Atlas network access

Free Render services have no fixed outbound IP address, so Atlas has to
accept `0.0.0.0/0` for the API to connect. That is a real weakening and the
reason the database password and a least-privilege database user matter more
than they otherwise would:

- Use a dedicated application user with `readWrite` on the one database, not
  an Atlas admin account.
- Use a long generated password, not one anybody typed.

A paid Render instance offers static outbound IPs, which is what you would
use to narrow the allow-list in a real deployment. Worth saying so in your
report — it is a trade-off you made knowingly, not an oversight.

### Seed the catalogue and the first administrator

Registration never grants the admin role, so the first administrator is
created by the seed script. From Render's **Shell** tab, or locally with
`MONGO_URI` pointing at Atlas:

```bash
npm run seed
```

### Cold starts

A free service sleeps after about 15 minutes of inactivity, and the next
request takes roughly 30–60 seconds while it wakes. The first page load of a
demo will look broken if nobody expects it. Open the API URL yourself a
minute before you present.

---

## 2. The client on GitHub Pages

### One-time repository settings

1. **Settings → Pages → Source: GitHub Actions.**
2. **Settings → Secrets and variables → Actions → Variables →
   New repository variable:**

   | Name | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://<service>.onrender.com/api` |

   A variable, not a secret. Everything Vite compiles ends up in the bundle
   and is readable by anyone who opens the site, so a secret placed here
   would not be secret. Nothing sensitive belongs in a `VITE_` value.

### What deploys

`.github/workflows/deploy-pages.yml` runs on every push to `main` that
touches `client/`. It installs, runs the test suite, builds, and publishes
`client/dist`. A failing test fails the deployment, which is the point.

The site lands at:

```
https://<owner>.github.io/SoftwareEngineering371_Project/
```

### Why the build needed changing

- **`base`** — Pages serves a project site from `/<repo>/`, not from the
  domain root, so every asset URL needs that prefix. `vite.config.js` applies
  it on `build` only; `npm run dev` still serves from `/`.
- **`basename`** — React Router has to strip the same prefix, otherwise every
  route is unmatched and the site is a permanent 404 page.
- **`404.html`** — Pages has no server-side routing. A request for
  `/products/123` finds no such file and is served `404.html`; the build
  copies `index.html` there, so the URL reaches React Router and the right
  page renders. Without it, only the home page survives a refresh.
- **`.nojekyll`** — stops Pages running the output through Jekyll, which
  silently drops files beginning with an underscore.

The last two are written by `client/scripts/spa-fallback.mjs`, which runs
automatically after `npm run build`.

---

## 3. Checking it works

1. `https://<service>.onrender.com/api/health` returns
   `{"status":"success"}`.
2. `https://<service>.onrender.com/api/products` returns the catalogue.
3. Open the Pages site, then the browser console. A CORS error names the
   origin it rejected — compare it against `CLIENT_ORIGIN` exactly.
4. Navigate to a product, then **refresh the page**. Still there means the
   404 fallback is working.
5. Register, add to cart, and check out with `4242 4242 4242 4242`.
6. Sign in as the seeded administrator and open `/admin`.

### When something is wrong

| Symptom | Cause |
|---|---|
| Blank page, console shows 404s for `/assets/...` | `base` does not match the repository name |
| Home page fine, refresh anywhere else 404s | `404.html` missing from the build output |
| `blocked by CORS policy` | `CLIENT_ORIGIN` has a path, a trailing slash, or the wrong host |
| `502` or a 60-second wait | Free instance waking up |
| API logs `Startup aborted` | `MONGO_URI` wrong, or the Atlas allow-list blocks Render |
| Everyone rate-limited at once | `trust proxy` not set — already handled in `src/app.js` |

---

## 4. What is deliberately not deployed

- **Payment is simulated.** No gateway is contacted and no card is charged.
  Card details never leave the browser; only the brand and last four digits
  are sent onward.
- **Email notifications are optional.** Without `SMTP_HOST` the contact form
  still saves the query, it just sends no email.
