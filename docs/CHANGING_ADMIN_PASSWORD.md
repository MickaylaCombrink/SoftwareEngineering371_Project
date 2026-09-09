# Changing the admin login details

The default seeded admin is `admin@ecommerce.local` / `ChangeMe123!` — change it before the
site is shown anywhere. There are three ways to set or reset admin credentials, in order of
preference.

---

## Method 1 — In the app (preferred, no shell needed)

1. Log in as the admin.
2. Go to **My Profile** (nav menu → your name).
3. Scroll to the **Change Password** card.
4. Enter your current password, the new password (min 8 characters), confirm it, and press
   **Update Password**.
5. You are signed out — log straight back in with the new password.

What happens behind the scenes:
- The backend verifies the *current* password first (`PUT /api/auth/change-password`).
- The new password is bcrypt-hashed (12 rounds) before storage.
- **Every refresh token you hold is revoked**, so the change takes effect on all devices at once.

> This works for any account (customer or admin). The form and endpoint are covered by tests.

---

## Method 2 — Set a strong admin password from the very first seed

The admin is created once by `npm run seed`. If it does **not** exist yet, its password comes
from the environment:

```bash
# Unix (Git Bash / WSL)
ADMIN_EMAIL=admin@yourbrand.co.za ADMIN_PASSWORD='PickAStrongOne!23' npm run seed

# Windows PowerShell
$env:ADMIN_EMAIL='admin@yourbrand.co.za'; $env:ADMIN_PASSWORD='PickAStrongOne!23'; npm run seed
```

Notes:
- The seed **never overwrites an existing admin's password** — it only creates the admin on
  first run (or re-promotes an existing user to `admin`).
- If you want both a strong password **and** a clean catalogue, combine with `--fresh`.

---

## Method 3 — Emergency reset (forgot the password / locked out)

Use the helper script when no one can log in. Run it from the repo root with the backend
`.env` in place (it connects to the same Mongo database):

```bash
npm install                                # once
npm run seed 2>&1 | Out-Null               # optional: connect sanity check
node src/scripts/resetAdminPassword.js admin@ecommerce.local 'NewStrongPass!456'
```

What the script does:
1. Connects via `MONGO_URI` from `.env`.
2. Fetches the user by email, hashes the new password (12 rounds).
3. Saves it, and — if that user is not yet `admin` — promotes them to `admin`.

Expected output:

```
MongoDB connected: <cluster>...
Password updated for admin@ecommerce.local.
```

If you rather go through **MongoDB Compass/Shell directly** (e.g. no Node available):

```js
// MongoDB shell on the ecommerce_SEN371 database
use ecommerce_SEN371
db.users.updateOne(
  { email: 'admin@ecommerce.local' },
  { $set: { password: '<a bcryptjs hash you generated with node: require("bcryptjs").hashSync("NewStrongPass!456", 12)>', role: 'admin' } }
)
```

> The DB stores bcrypt hashes only — never a searchable plaintext. Any reset must hash the
> new value with bcrypt first.

---

## Changing the admin email address

The email is fixed by the registered account and cannot be edited in the UI (the Profile
email field is read-only, deliberately). To change it:

```bash
# MongoDB Compass (simplest): edit the user's email field on ecommerce_SEN371.users
# or, from the repo root, with mongosh semantics — the helper above accepts the new email only
# for lookup, not for renaming. Rename in MongoDB directly:
npm run seed 2>&1 | Out-Null   # ensure .env is valid first
node -e "require('dotenv').config(); const m=require('mongoose'); const {connectDB,disconnectDB}=require('./src/config/db'); (async()=>{await connectDB(); const r=await require('./src/models/User').updateOne({email:'admin@ecommerce.local'},{$set:{email:'admin@yourbrand.co.za'}}); console.log('Matched',r.matchedCount,'Modified',r.modifiedCount); await disconnectDB(); process.exit(0);})()"
```

Then log in with the new email.

---

## Never do these

- ✗ Do **not** edit `src/scripts/seed.js` to hard-code your real password — it's committed to git.
- ✗ Do **not** put `ADMIN_PASSWORD` in `.env.example`.
- ✗ Do **not** store plaintext passwords anywhere in the repo.

See `docs/RUNBOOK.md` for the related credential-rotation warning before any public push.