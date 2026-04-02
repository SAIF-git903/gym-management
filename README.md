# Gym Management (Next.js full stack)

Single **Next.js** app: **App Router UI** + **Route Handlers** (`/api/*`) for the same server. Deploy **one** service (e.g. Vercel, Railway, Node host); **MongoDB** stays external.

## Stack

- **Next.js 15** (React 19), **Tailwind CSS v4**
- **Mongoose** + **JWT** + **bcrypt** (gym owner login; members are records only)
- No separate Express or Vite app

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Environment** — copy `.env.example` to **`.env.local`** (Next loads this automatically):

   ```bash
   copy .env.example .env.local
   ```

   Set at least:

   - `MONGODB_URI`
   - `JWT_SECRET`

3. **Create the gym owner** (no sign-up in the app):

   ```bash
   npm run create-owner
   ```

   Set `OWNER_NAME`, `OWNER_EMAIL`, `OWNER_PASSWORD` in `.env.local`, or:

   ```bash
   node scripts/create-owner.mjs "Gym Owner" owner@example.com yourPassword
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) → **Sign in** → Dashboard / Members.

## Production

```bash
npm run build
npm start
```

Set the same env vars on the host (`MONGODB_URI`, `JWT_SECRET`, optional `JWT_EXPIRES_IN`).

## Project layout

```
app/
  api/           # REST handlers (auth, members, dashboard)
  (dashboard)/   # Protected UI: /, /members, …
  login/
lib/
  models/        # Mongoose User, Member
  api/client.js  # Axios → same-origin /api
components/
context/
scripts/create-owner.mjs
docs/API.md
```

## API docs

See [docs/API.md](docs/API.md). All routes are under **`/api`** (e.g. `POST /api/auth/login`).

## Notes

- **CORS**: not needed; the browser only talks to the same Next origin.
- **Migrating from the old repo**: if you had `backend/.env`, copy its values into **`.env.local`** at the project root.
