/**
 * PATCH /api/bookings/:id — Update booking status (accept / decline / waitlist).
 *
 * Body: { action: "accept" | "decline" | "waitlist", reason?: DeclineReason }
 *
 * DP1 — Decline with reason:
 *   action="decline" requires reason (FullyBooked | NotAFit | RateMismatch | Other)
 *   stored in declineReason column. Clients can see this reason + "Browse similar gigs".
 *
 * DP2 — Capacity enforcement at accept:
 *   action="accept" checks acceptedCount vs concurrentCapacity.
 *   If full, returns 409 with { error, capacityFull: true } so the UI can
 *   offer a "Waitlist" fallback action instead.
 *   action="waitlist" always succeeds (no capacity check).
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, reason } = body;

    if (!["accept", "decline", "waitlist"].includes(action)) {
      return NextResponse.json(
        { error: "action must be accept | decline | waitlist" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        gig: {
          include: {
            bookings: { select: { status: true } },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // DP2: Capacity check on accept
    if (action === "accept") {
      const acceptedCount = booking.gig.bookings.filter(
        (b) => b.status === "Accepted"
      ).length;

      if (acceptedCount >= booking.gig.concurrentCapacity) {
        return NextResponse.json(
          {
            error: "Capacity full — waitlist instead?",
            capacityFull: true,
            concurrentCapacity: booking.gig.concurrentCapacity,
          },
          { status: 409 }
        );
      }
    }

    // DP1: Require reason on decline
    if (action === "decline") {
      if (!reason) {
        return NextResponse.json(
          { error: "reason is required for decline action" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status:
          action === "accept"
            ? "Accepted"
            : action === "decline"
            ? "Declined"
            : "Waitlisted",
        declineReason:
          action === "decline"
            ? (reason as "FullyBooked" | "NotAFit" | "RateMismatch" | "Other")
            : null,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/bookings/:id]", err);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
