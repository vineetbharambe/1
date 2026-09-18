# SkillSwap — Decision Points

---

## DP1 — Rejection Handling

**Decision:** When a creator declines a booking request, they must select a reason from a fixed enum: *Fully Booked*, *Not a Fit*, *Rate Mismatch*, or *Other*. This reason is stored on the `Booking` record and displayed to the client on their My Bookings page. Additionally, a "Browse similar gigs" button deep-links to the marketplace pre-filtered by that gig's category.

**Justification:**

> _[Fill in 2–4 sentences explaining your design rationale here.]_

---

## DP2 — Double-Booking / Concurrent Capacity

**Decision:** Gigs have a `concurrentCapacity` field (default 1). Booking requests always create as `Pending` — clients are never blocked from submitting. Capacity is enforced only at **accept time**: if the creator tries to accept a booking when `acceptedCount >= concurrentCapacity`, the API returns a 409 with `{ capacityFull: true }`, and the UI prompts the creator to **Waitlist** the client instead of hard-blocking the action.

**Justification:**

> _[Fill in 2–4 sentences explaining your design rationale here.]_

---

## DP3 — Discovery / Trust Sort

**Decision:** The default marketplace sort is "Trust Score," computed server-side per gig:

```
trustScore = normalize(acceptedRatio) × 0.5
           + normalize(recencyBoost)  × 0.3
           + deterministicJitter      × 0.2
```

Where `acceptedRatio = acceptedBookings / totalBookings`, `recencyBoost = 1` if the gig is <48 h old, and jitter is a deterministic value derived from the gig ID (so results are stable across requests). Alternate sorts — Newest, Price Low→High, Price High→Low — are available via a dropdown.

**Justification:**

> _[Fill in 2–4 sentences explaining your design rationale here.]_
