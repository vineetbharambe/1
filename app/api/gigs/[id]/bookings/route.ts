/**
 * GET /api/gigs/:id/bookings — Fetch all bookings for a specific gig.
 * Used by the creator dashboard to manage incoming booking requests.
 * Returns the full booking list ordered by requestedAt (newest first).
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gig = await prisma.gig.findUnique({ where: { id: params.id } });
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    const bookings = await prisma.booking.findMany({
      where: { gigId: params.id },
      orderBy: { requestedAt: "desc" },
    });

    return NextResponse.json({
      gig,
      bookings,
      acceptedCount: bookings.filter((b) => b.status === "Accepted").length,
    });
  } catch (err) {
    console.error("[GET /api/gigs/:id/bookings]", err);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
