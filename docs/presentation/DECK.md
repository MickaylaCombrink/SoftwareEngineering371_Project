# SEN371 — Milestone 5 Presentation Deck

**Project:** Scent — Perfume E-Commerce Platform  
**Course:** Software Engineering 371  
**Team:** [Nathi Mathenjwa · Mickayla Combrink · Momelezi] — *edit names*  
**Date:** September 2026

Format: one `---` = one slide. **Bold** text = what the assessor sees; the indented lines
are your speaker notes. Copy/paste each slide into Google Slides / PowerPoint, or run the
deck as plain markdown.

---

# Slide 1 — Title

**Scent: A Boutique Perfume Store, End to End**
REST API · React SPA · Real Photography · 192 Automated Tests

> Speaker notes: Intro. "Welcome. This is our e-commerce project for SEN371 — a perfume
> boutique called Scent. In this demo we'll show a working store with real product
> photography, role-based shopping, and a fully automated test suite." Keep it to 30 seconds.

---

# Slide 2 — The brief

**Build a full e-commerce system:**
- Product catalogue a shopper can search, filter and purchase
- Accounts, a cart and a checkout that respects real stock
- Admin controls for orders and inventory
- Automated tests proving it all works

> Speaker notes: "The brief asked for an e-commerce system with real shopping behaviour: a
> searchable catalogue, per-user carts, stock-aware checkout, and an admin side. We wanted a
> product that looks like a real boutique, not a coursework skeleton — hence the photography
> and the branding."

---

# Slide 3 — Architecture & stack

**Two apps, one data model**

```
React SPA (Vite) ──HTTP /api──► Express API ──► MongoDB (Mongoose)
  Port 5173                        Port 5000        Atlas / local
```

- **Backend:** Express, Mongoose, JWT (access + refresh), bcrypt, helmet, rate limiting
- **Frontend:** React 19, React Router 7, Tailwind CSS 4, Vite 8
- **Layering:** routes → controllers → repositories → models

> Speaker notes: "Three layers: the React SPA, the Express API, and MongoDB. The backend is
> strictly layered — routes, controllers, repositories, models — which is what keeps 40+
> endpoints testable. Auth uses short-lived access tokens plus rotating refresh tokens."

---

# Slide 4 — Milestones

| Milestone | Delivered |
|---|---|
| 1 · Brief | Initiation, requirements, API design agreed by team |
| 2 · Backend | Full REST API + integration tests (Jest) |
| 3 · Frontend | React SPA wired to the API + component tests (Vitest) |
| 5 · Testing & presentation | Test-report, coverage, deployment config, this demo |

> Speaker notes: "Milestone 2 gave us the tested API. Milestone 3 added the browser app. What
> you'll see today is Milestone 5: the full report, coverage, deployment config and live demo.
> Milestone 4's environments were folded into the deployment section of the runbook."

---

# Slide 5 — Backend highlights

**What the API does right:**
- Stock is decremented **atomically** at checkout — no overselling
- Passwords are **bcrypt(12)** and never serialised
- Roles are never taken from the client (`restrictTo('admin')`)
- **Every** auth route is rate-limited; login gets the tightest limit
- Refresh tokens are revocable per user (changed password revokes them)
- Consistent error shape; 409/400/401/403/404 mapped automatically

> Speaker notes: "Three things I'd defend in a code review: checkout cannot oversell because
> stock decrement is a single atomic Mongo operation; self-promotion to admin is impossible
> because role is server-assigned; and login is rate-limited against password guessing."

---

# Slide 6 — Frontend & the brand

**A boutique feel, not a template:**
- Design system in one CSS file — ink, ivory, champagne-gold
- Playfair Display + Jost typography; gold pill buttons; custom favicon
- Full store: browse, filter, cart, checkout, order history, profile
- **Admin dashboard:** revenue, order volume, per-order status control
- **Change your password** from your profile — signs out across devices

> Speaker notes: "The UI work was 'make it a brand'. We chose a warm luxury palette, an
> editorial serif for headings, and a consistent component language for every screen. The
> admin dashboard is a real tool, not a stub — trend chart, revenue, order management."

---

# Slide 7 — The catalogue

**41 real products, 7 fragrance families**

- Oud · Gourmand · Amber · Floral · Woody · Oriental · Fresh
- Every product uses a real photograph served from the app
- Realistic prices and stock; evocative copy for each scent
- Filter by family, price range, availability, or search by name

> Speaker notes: "The product photography is real — we prepared a catalogue of 41 perfumes
> across 7 fragrance families, each with its actual bottle image. Shopping feels real because
> the assets are real. The seed is idempotent, so the data is reproducible anywhere."

---

# Slide 8 — Testing strategy

**192 tests, two suites, every layer**

| Layer | Tool | Covers |
|---|---|---|
| Backend integration | Jest + Supertest | auth, cart, orders, products, errors, repositories |
| Frontend component | Vitest + Testing Library | pages, components, contexts, hooks |

- Backend line coverage **76%**, frontend **82%**
- Full report in `TESTING.md` (strategy, coverage tables, defect log)

> Speaker notes: "We test at the seams a reviewer cares about: blocked checkout, wrong
> credentials, oversell attempts, admin-only routes, token refresh, and the whole user
> journey in the browser DOM. Coverage re-runs with one command and is checked into the repo."

---

# Slide 9 — Bugs our tests caught

| Bug | Where | How it was caught |
|---|---|---|
| Checkout called `/orders/checkout`, but the route is `/orders` — every payment 404'd | `Checkout.jsx` | Contract trace during milestone 3 hand-over |
| Cart page crashed on empty/updated state | `CartContext` reducer | Cart context component test |
| Jest accidentally scanned the frontend and failed | root `package.json` | Full-suite double run |
| Admin order listing endpoint missing | backend | Frontend admin dashboard planning |

> Speaker notes: "The most satisfying was the checkout bug: the UI called a route the API
> never had, so every purchase failed. Fixing the client and pinning it with a test means the
> contract can't drift again. These are exactly the defects testing exists to catch."

---

# Slide 10 — Security posture

- JWT access token (15 min) + refresh token (7 days), rotated on refresh
- bcrypt hashing, password change revokes existing refresh tokens
- `helmet`, CORS allow-list, express-rate-limit
- `.env` gitignored; `.env.example` ships placeholders only
- **Credential hygiene call-out:** an earlier commit contained a real Atlas URI. It has been
  scrubbed from the working tree, and the team will rotate the DB password before sharing the
  repo. Detailed in the runbook §7.

> Speaker notes: "Security section: this is coursework, but we treated it like a product.
> Password rotation on change, rate limiting, and role checks in middleware. One honest note:
> early in the project a connection string with a real password was committed. We removed it
> from templates and will rotate the database credential before the repo is shared — it's in
> our runbook as a hard requirement."

---

# Slide 11 — Deployment, ready to flip

**Config in the repo, waiting on credentials**

```
render.yaml        Render Blueprint: scent-api (Node) + scent-client (static)
client/vercel.json Vercel SPA rewrites for React Router
.env.example       every variable the deploy needs, documented
```

- Post-deploy checklist in `docs/RUNBOOK.md`
- Local URLs: API `:5000/api` · app `:5173` (with `/api` proxy)

> Speaker notes: "Deployment is configured and documented but intentionally not live, because
> it needs the team's accounts and the Atlas credential rotation first. The runbook includes
> the exact env vars and a post-deploy test list — flip the switch, then run the checklist."

---

# Slide 12 — Demo roadmap

1. Home — hero, photography, featured products
2. Browse & filter the 41-product catalogue
3. Product detail → add to cart
4. Checkout places an order (stock decreases)
5. Admin dashboard — revenue, orders, status control
6. Change the admin password and sign back in

> Speaker notes: "The demo follows the natural shopper journey, then flips to the admin side,
> and finishes with something most coursework demos skip — actually changing credentials."

---

# Slide 13 — Challenges & lessons

- **Test the contracts, not just the code** — the checkout 404 was a contract bug
- **Real assets change the feel** — photography made the demo credible
- **Design systems pay off** — one palette keeps 20 screens consistent
- **Secrets leak in commit messages and examples** — guard `.env.example` from day one

> Speaker notes: "If we restarted, we'd test contract shapes earlier and generate env
> examples with CI. The biggest win was treating assets and branding as first-class — it's
> what makes the project memorable to a client."

---

# Slide 14 — Thank you / Q&A

**Questions?**

> Speaker notes: "Happy to open the code, re-run the test suite live, or walk through the
> runbook. Thank you."