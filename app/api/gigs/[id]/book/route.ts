/**
 * POST /api/gigs/:id/book — Book a gig as a client.
 *
 * Body: { clientName, note? }
 *
 * DP2 — Capacity logic:
 *   - Pending bookings are NEVER blocked. Any client can submit a request.
 *   - New bookings always start as "Pending".
 *   - Capacity enforcement happens at ACCEPT time (see PATCH /api/bookings/:id).
 *   - The creator sees all pending requests and decides who gets in.
 *
 * Returns 404 if gig not found, 400 if required fields missing.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { clientName, note } = body;

    if (!clientName) {
      return NextResponse.json(
        { error: "clientName is required" },
        { status: 400 }
      );
    }

    const gig = await prisma.gig.findUnique({ where: { id: params.id } });
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    // Pending bookings are never blocked (DP2)
    const booking = await prisma.booking.create({
      data: {
        gigId: params.id,
        clientName,
        note: note ?? null,
        status: "Pending",
      },
      include: { gig: true },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    console.error("[POST /api/gigs/:id/book]", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
