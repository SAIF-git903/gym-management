# Gym Management API (Next.js Route Handlers)

Base URL: same as the app (e.g. `http://localhost:3000`). JSON endpoints live under **`/api`**.

Authenticated requests need:

```http
Authorization: Bearer <JWT>
```

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Liveness check |

**Response:** `{ "ok": true }`

---

## Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Gym owner sign in |
| GET | `/api/auth/me` | Yes | Current user profile |

There is **no** register endpoint; create the owner with `npm run create-owner`.

### POST `/api/auth/login`

**Body (JSON):**

| Field | Type |
|-------|------|
| email | string |
| password | string |

**Response `200`:** `{ token, user: { id, name, email, role } }`

**Errors:** `401` invalid credentials

### GET `/api/auth/me`

**Response `200`:** `{ user: { id, name, email, role } }`

---

## Members (gym owner only)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/members` | List with pagination, search, filters |
| GET | `/api/members/:id` | Single member |
| POST | `/api/members` | Create member |
| PUT | `/api/members/:id` | Update member |
| DELETE | `/api/members/:id` | Delete member |

### GET `/api/members`

**Query:** `page`, `limit`, `search`, `paymentStatus`, `plan`, `membershipStatus` (same semantics as before).

**Response `200`:** `{ data, pagination }`

### POST `/api/members`

**Body:** `name`, `phone`, optional `email` (omit or empty if none; if set, must be valid), optional `address`, `notes` (max 5000), optional `membershipFee` (non‑negative number in **PKR**, default `0`), optional `bloodGroup` (`''` or `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`), `plan`, `startDate`, `endDate` (ISO), optional `paymentStatus`.

### PUT `/api/members/:id`

Partial updates allowed.

---

## Dashboard (gym owner only)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/stats` | Counts, revenue estimate, expiring soon |

---

## Errors

Validation: `400` with `{ message, errors[] }`. Other errors: `{ message }` with appropriate status.
