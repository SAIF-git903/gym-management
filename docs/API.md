# Gym Management API

Base URL: `http://localhost:5000` (or your `PORT`).

All authenticated routes require header:

```http
Authorization: Bearer <JWT>
```

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Liveness check |

**Response:** `{ "ok": true }`

---

## Authentication

There is **no** `POST /auth/register`. The gym owner user is created in MongoDB (e.g. `npm run create-owner` in the backend — see project README).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | No | Gym owner sign in |
| GET | `/auth/me` | Yes | Current user profile |

### POST `/auth/login`

**Body (JSON):**

| Field | Type |
|-------|------|
| email | string |
| password | string |

**Response `200`:** `{ token, user: { id, name, email, role } }`

**Errors:** `401` invalid credentials

### GET `/auth/me`

**Response `200`:** `{ user: { id, name, email, role } }`

---

## Members (gym owner only)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/members` | List with pagination, search, filters |
| GET | `/members/:id` | Single member |
| POST | `/members` | Create member |
| PUT | `/members/:id` | Update member |
| DELETE | `/members/:id` | Delete member |

### GET `/members`

**Query parameters:**

| Param | Description |
|-------|-------------|
| page | Page number (default `1`) |
| limit | Page size (default `10`, max `100`) |
| search | Substring match on name, email, phone |
| paymentStatus | `paid` or `unpaid` |
| plan | `monthly`, `quarterly`, `half-yearly`, `yearly` |
| membershipStatus | `active` (endDate ≥ now) or `expired` |

**Response `200`:**

```json
{
  "data": [ /* members */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### POST `/members`

**Body (JSON):**

| Field | Type | Notes |
|-------|------|--------|
| name | string | required |
| phone | string | required |
| email | string | required |
| address | string | optional |
| notes | string | optional, internal (max 5000 chars); included in `search` |
| plan | string | `monthly` \| `quarterly` \| `half-yearly` \| `yearly` |
| startDate | string | ISO 8601 date |
| endDate | string | ISO 8601 date |
| paymentStatus | string | optional, `paid` \| `unpaid` (default `unpaid`) |

**Response `201`:** created member document

### PUT `/members/:id`

Same fields as POST; all optional (only send fields to update).

**Response `200`:** updated member

**Errors:** `404` if not found

### DELETE `/members/:id`

**Response `200`:** `{ "message": "Member removed" }`

---

## Dashboard (gym owner only)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/stats` | Counts, revenue estimate, expiring soon |

**Response `200` (summary):**

- `totalMembers`, `activeMembers`, `expiredMembers`, `paidMembersCount`
- `revenueOverview`: `estimatedTotal`, `byPlan[]`, `note`
- `expiringWithin7Days`: array of members with `endDate` within 7 days

---

## Error format

Validation errors often return `400`:

```json
{
  "message": "Validation failed",
  "errors": [ { "msg": "...", "path": "email", ... } ]
}
```

Other errors return JSON `{ "message": "..." }` with appropriate status codes (`401`, `403`, `404`, `500`).
