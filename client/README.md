# Client (front end)

PERSON 3 — set this up while you are blocked on the backend.

Not created yet. From the repository root:

```bash
npm create vite@latest client -- --template react
cd client
npm install
npm run dev
```

Point it at the API with `VITE_API_BASE_URL` (already in `.env.example`,
default `http://localhost:5000/api`).

`client/dist/` and `node_modules/` are already covered by the root
`.gitignore`.
