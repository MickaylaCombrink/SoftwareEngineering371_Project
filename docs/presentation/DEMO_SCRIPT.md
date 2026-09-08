# Demo Script — Scent Perfume Boutique

A narrated, timed walkthrough (~8 minutes). Run against a **seeded, locally running** app
(backend :5000, frontend :5173). Before the demo, run:

```bash
npm run seed -- --fresh
cd client && npm run dev      # separate terminal: back to repo root first, then npm run dev
```

> **Pre-demo checks (30 s):**
> ✓ products load with photos (home hero shows a real bottle image)
> ✓ admin can log in: `admin@ecommerce.local` / the password you set
> ✓ a customer account exists OR you register one on screen

---

## Scene 1 — Brand & home (0:00–0:45)

**Actions:** Open `http://localhost:5173`. Slowly scroll the Home page.

**Narration:**
> "Welcome to Scent. This is a boutique perfume store built as a full-stack product — a
> React front end, an Express API, and MongoDB. The home page sets the luxury tone with its
> hero, photography, and fragrance families. This is the first thing a shopper sees, so the
> design work focused on making it feel like a real boutique rather than a coursework site."

**On screen:** hero headline + image, category tiles, featured products with real bottle
photos, benefits strip.

---

## Scene 2 — Browsing and filtering the catalogue (0:45–2:00)

**Actions:** Click **Products** in the nav → click the **Oud** category chip → set a price
range (e.g. 500–900) → clear → type "bentley" in search → clear.

**Narration:**
> "The full catalogue holds 41 real products across seven fragrance families. The filters are
> server-side — they hit the API with query parameters — so the data is always a true slice
> of the database: category, price band, in-stock only, and keyword search. Here I'm mixing a
> family filter with a price band; every change is a real API call, not client-side filtering."

**On screen:** product grid updates per filter/chip/search.

---

## Scene 3 — Product detail → add to cart (2:00–2:50)

**Actions:** Pick any product (hover reveals **View**) → on the detail page click **Add to
Cart** → open the **Cart** (nav badge shows "1").

**Narration:**
> "A product page shows the photograph, price, stock level, and description. Adding to cart
> immediately updates the nav badge. The cart itself is server-backed — the API keeps a cart
> per user, so refreshing the page keeps the items, and stock is checked at the very end."

**On screen:** badge changes; Cart lists items, quantities editable, totals correct.

---

## Scene 4 — Checkout places a real order (2:50–4:00)

**Actions:** In **Cart**, adjust a quantity → click **Place Order** → land on **My Orders**
with the new order marked *Pending*.

**Narration:**
> "This is the moment most demo bugs hide. When we first built this, the front end called a
> route the API didn't have, so every checkout 404'd — our test suite now pins the correct
> contract. Checkout decrements stock atomically, clears the cart, and creates an order
> record. Note stock also dropped for that product."

**On screen:** order created (status Pending, id like `#1A2B3C4D`), cart emptied, product
stock reduced.

---

## Scene 5 — The admin dashboard (4:00–6:00)

**Actions:** Log out → log in as **admin** → **Admin** appears in the nav → open it →
expand/filter an order → flip one from *Pending* to *Shipping* → refresh orders to show it.

**Narration:**
> "Now the admin side. The dashboard shows revenue and order volume, and every order in the
> shop with its buyer. Fulfilment lives here — changing a status is an admin-only API call.
> Registration can never create an admin, so the shop owner role belongs to whoever was seeded
> as administrator."

**On screen:** revenue figures, order list, status select → Shipping, persisted after reload.

---

## Scene 6 — Change the password (6:00–7:15)

**Actions:** Open **My Profile** → scroll to **Change Password** → enter current + new (min 8
chars) → **Update Password** → you're signed out → log back in with the new password.

**Narration:**
> "Credentials are real in this project. The profile page lets any user rotate their
> password; the API verifies the current password, hashes the new one, and revokes every
> refresh token the account holds — old sessions are invalid everywhere. You're then asked to
> sign in again with the new password."

**On screen:** success toast → signed out → login page → successful login with the new
password.

> **Reminder:** change the demo admin password back afterwards, or run
> `node src/scripts/resetAdminPassword.js admin@ecommerce.local <password>` so the next
> session isn't locked out.

---

## Scene 7 — Proof the code is tested (7:15–8:00, optional live)

**Actions:** In a terminal run `npm test` (backend) and `cd client && npm test` (frontend).

**Narration:**
> "To close, the tests. Backend: 91 integration tests against an in-memory MongoDB — real
> Mongoose, real HTTP, no mocks at the database seam. Frontend: 88 tests through Testing
> Library, including the user journeys you just watched. Combined line coverage is about 80%,
> and the full report with coverage tables and our defect log is in TESTING.md."

**On screen:** green suites pass; point at TESTING.md coverage table.

---

## Closing (8:00)

> "Questions on the architecture, the testing, or deployment are welcome — the runbook covers
> shipping this to Render or Vercel."