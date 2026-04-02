# Gym Management Web App

Full-stack gym app: **React (Vite) + Tailwind**, **Node.js + Express + MongoDB + Mongoose**, **JWT** auth. One **gym owner** account signs in; **members** are records you add in the app (no member self-sign-up).

## Project structure

```
gym-management/
├── backend/          # Express API (MVC)
├── frontend/         # React SPA
└── docs/
    └── API.md        # REST API reference
```

## Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string

## Backend setup

1. Copy environment file:

   ```bash
   cd backend
   copy .env.example .env
   ```

   On macOS/Linux: `cp .env.example .env`

2. Edit `backend/.env`:

   - `MONGODB_URI` — your MongoDB URL
   - `JWT_SECRET` — long random secret (required)
   - `PORT` — default `5000`
   - `CLIENT_URL` — frontend origin, default `http://localhost:5173`

3. Install and run:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

   API: `http://localhost:5000`

## Frontend setup

1. Copy environment file:

   ```bash
   cd frontend
   copy .env.example .env
   ```

2. Ensure `VITE_API_URL` matches your API (e.g. `http://localhost:5000`).

3. Install and run:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   App: `http://localhost:5173`

## First use — create the gym owner

There is **no sign-up in the app**. Create the owner user in MongoDB once (password is stored bcrypt-hashed by the app).

**Recommended:** from `backend/`, add `OWNER_NAME`, `OWNER_EMAIL`, and `OWNER_PASSWORD` to `.env` (see `.env.example`), then:

```bash
npm run create-owner
```

**Or** via CLI (same folder):

```bash
node scripts/create-owner.mjs "Gym Owner" owner@example.com yourSecurePassword
```

Then start the API, open the frontend, and **Sign in** with that email and password. Use **Members** to add gym members.

## Features

- JWT auth; member and dashboard routes require a valid gym-owner token (`POST /auth/login` only — no public register)
- Members: create, list (table), edit, delete, search, filters (payment, plan, active/expired), pagination
- Dashboard: totals, active/expired counts, simple revenue estimate from plan defaults, memberships expiring within 7 days
- Responsive layout with sidebar; dark mode toggle (class on `<html>`)
- Client-side form validation; server-side validation with `express-validator`

## Production build (frontend)

```bash
cd frontend
npm run build
npm run preview
```

Serve the `frontend/dist` folder behind your static host or reverse proxy, and point `VITE_API_URL` at your deployed API.

## API documentation

See [docs/API.md](docs/API.md) for endpoints, payloads, and query parameters.

## Tech notes

- Backend uses ES modules (`"type": "module"`).
- Member `createdAt` / `updatedAt` come from Mongoose `timestamps`.
- CORS is restricted to `CLIENT_URL` for browser requests.
# gym-management
# gym-management
