# SkillSwap — Creator Gig Marketplace

> **Where creators cash in on what they know.**

**Hackathon ID:** `<PASTE_ID_HERE>`

---

## Track

Creator Economy / Gig Marketplace

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| ORM | Prisma |
| DB (dev) | SQLite (`file:./dev.db`) |
| DB (prod) | PostgreSQL — Neon free tier |
| Deploy | Vercel |
| Auth | ❌ None — localStorage display name only |

## Deployed URL

> **<PASTE_VERCEL_URL_HERE>**

---

## Local Development

### Prerequisites

- Node.js 18+
- npm 9+

### Steps

```bash
# 1. Clone and enter directory
cd skillswap

# 2. Install dependencies
npm install

# 3. Set up local environment
cp .env.example .env.local
# .env.local already has SQLite defaults — no changes needed for local dev

# 4. Generate Prisma client and push schema to SQLite
npx prisma generate
npx prisma db push

# 5. (Optional) Seed sample data
npx prisma db seed

# 6. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Local | Production |
|----------|-------|------------|
| `DB_PROVIDER` | `sqlite` | `postgresql` |
| `DATABASE_URL` | `file:./dev.db` | `postgres://...` (Neon) |

---

## Production Deployment (Vercel + Neon)

1. Create a free Neon database at [neon.tech](https://neon.tech)
2. Copy the connection string (pooled, `?pgbouncer=true&connect_timeout=15`)
3. Add to Vercel environment variables:
   ```
   DB_PROVIDER=postgresql
   DATABASE_URL=postgres://...
   ```
4. On first deploy, run migrations:
   ```bash
   npx prisma migrate deploy
   ```
   Or via Vercel build command:
   ```
   npx prisma generate && npx prisma migrate deploy && next build
   ```

---

## API Routes

All routes return JSON. No authentication headers required on any route.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/gigs` | List gigs. Supports `?search=`, `?category=`, `?sort=trust\|newest\|price_asc\|price_desc` |
| `POST` | `/api/gigs` | Create a new gig |
| `GET` | `/api/gigs/:id` | Fetch a single gig |
| `POST` | `/api/gigs/:id/book` | Book a gig (always creates as Pending) |
| `GET` | `/api/gigs/:id/bookings` | List bookings for a gig (creator view) |
| `GET` | `/api/bookings?client=NAME` | List bookings for a client name |
| `PATCH` | `/api/bookings/:id` | Update booking: `{ action: "accept" \| "decline" \| "waitlist", reason? }` |

### Standard Track API

This app implements a custom REST API as specified in the hackathon brief. If the hackathon provides a "standard track API" spec, the routes above were designed to be compatible with the described endpoint structure. Check the hackathon docs for any additional required endpoints.

---

## Features

- ✅ No login/signup anywhere — localStorage display name only
- ✅ Persona switcher: "I'm a Creator" / "I'm a Client"
- ✅ Post gigs with concurrent capacity
- ✅ Browse/search/filter/sort marketplace (with Trust Score algorithm)
- ✅ Book gigs — capacity never blocks requests
- ✅ Creator dashboard — Accept/Decline/Waitlist bookings
- ✅ Decline with reason enum (DP1)
- ✅ Capacity enforcement at accept-time with Waitlist fallback (DP2)
- ✅ Trust score sort algorithm (DP3)
- ✅ "Browse similar gigs" deep link from declined bookings
- ✅ Toast notifications, skeleton loaders, empty states
- ✅ Fully responsive (mobile-first)
- ✅ New/Popular pills on gig cards
