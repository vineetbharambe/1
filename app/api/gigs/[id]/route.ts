/**
 * GET /api/gigs/:id — Fetch a single gig by ID, including booking counts.
 * Returns 404 if not found.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gig = await prisma.gig.findUnique({
      where: { id: params.id },
      include: {
        bookings: { select: { status: true } },
      },
    });

    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    const acceptedCount = gig.bookings.filter((b) => b.status === "Accepted").length;
    const totalBookings = gig.bookings.length;

    return NextResponse.json({ ...gig, acceptedCount, totalBookings });
  } catch (err) {
    console.error("[GET /api/gigs/:id]", err);
    return NextResponse.json({ error: "Failed to fetch gig" }, { status: 500 });
  }
}
