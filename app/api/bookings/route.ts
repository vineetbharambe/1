/**
 * GET /api/bookings?client=NAME — Fetch all bookings for a given client name.
 * Used by the "My Bookings" page. No auth required — uses display name from localStorage.
 * Returns bookings grouped and ordered by requestedAt descending.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const client = searchParams.get("client");

    if (!client) {
      return NextResponse.json(
        { error: "?client= query param required" },
        { status: 400 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: { clientName: client },
      include: {
        gig: {
          select: {
            id: true,
            title: true,
            category: true,
            rate: true,
            creatorName: true,
          },
        },
      },
      orderBy: { requestedAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (err) {
    console.error("[GET /api/bookings]", err);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
