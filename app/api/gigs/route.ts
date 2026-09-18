/**
 * GET  /api/gigs  — List gigs with optional search, category filter, creator filter, and sort.
 *   ?search=   partial match on title or description (case-insensitive)
 *   ?category= exact match on category name
 *   ?creator=  exact match on creatorName (used by dashboard)
 *   ?sort=     trust | newest | price_asc | price_desc  (default: trust)
 *
 * POST /api/gigs — Create a new gig.
 *   Body: { creatorName, title, category, rate, description, concurrentCapacity? }
 *
 * DP3 — Trust Score (computed here):
 *   trustScore = normalize(acceptedRatio) * 0.5
 *              + normalize(recencyBoost)  * 0.3
 *              + jitter                  * 0.2
 *   where acceptedRatio = accepted / total bookings, recencyBoost = 1 if <48h
 *   Normalization is across the returned result set.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Compute trust score for a gig (DP3)
function computeTrustScore(
  acceptedCount: number,
  totalBookings: number,
  createdAt: Date,
  maxAcceptedRatio: number,
  seed: string
): number {
  const acceptedRatio =
    totalBookings > 0 ? acceptedCount / totalBookings : 0;
  const normalizedAccepted =
    maxAcceptedRatio > 0 ? acceptedRatio / maxAcceptedRatio : 0;

  const ageMs = Date.now() - new Date(createdAt).getTime();
  const recencyBoost = ageMs < 48 * 60 * 60 * 1000 ? 1 : 0;

  // Deterministic jitter from gig id to avoid re-shuffle on every request
  const jitter =
    (parseInt(seed.replace(/[^0-9]/g, "").slice(0, 8) || "0") % 1000) / 1000;

  return normalizedAccepted * 0.5 + recencyBoost * 0.3 + jitter * 0.2;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? "";
    const creator = searchParams.get("creator") ?? "";
    const sort = searchParams.get("sort") ?? "trust";

    const gigs = await prisma.gig.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search } },
                  { description: { contains: search } },
                ],
              }
            : {},
          category ? { category } : {},
          creator ? { creatorName: creator } : {},
        ],
      },
      include: {
        bookings: { select: { status: true } },
      },
      orderBy:
        sort === "newest"
          ? { createdAt: "desc" }
          : sort === "price_asc"
          ? { rate: "asc" }
          : sort === "price_desc"
          ? { rate: "desc" }
          : { createdAt: "desc" }, // trust sort applied after
    });

    // Annotate with counts
    const annotated = gigs.map((gig) => {
      const accepted = gig.bookings.filter((b) => b.status === "Accepted").length;
      const total = gig.bookings.length;
      return { ...gig, acceptedCount: accepted, totalBookings: total };
    });

    // Apply trust sort (DP3)
    if (sort === "trust" || !sort) {
      const maxAcceptedRatio = Math.max(
        ...annotated.map((g) =>
          g.totalBookings > 0 ? g.acceptedCount / g.totalBookings : 0
        ),
        1
      );
      const withScores = annotated.map((g) => ({
        ...g,
        trustScore: computeTrustScore(
          g.acceptedCount,
          g.totalBookings,
          g.createdAt,
          maxAcceptedRatio,
          g.id
        ),
      }));
      withScores.sort((a, b) => b.trustScore - a.trustScore);
      return NextResponse.json(withScores);
    }

    return NextResponse.json(
      annotated.map((g) => ({ ...g, trustScore: null }))
    );
  } catch (err) {
    console.error("[GET /api/gigs]", err);
    return NextResponse.json({ error: "Failed to fetch gigs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      creatorName,
      title,
      category,
      rate,
      description,
      concurrentCapacity,
    } = body;

    if (!creatorName || !title || !category || rate == null || !description) {
      return NextResponse.json(
        { error: "Missing required fields: creatorName, title, category, rate, description" },
        { status: 400 }
      );
    }

    const gig = await prisma.gig.create({
      data: {
        creatorName,
        title,
        category,
        rate: parseFloat(rate),
        description,
        concurrentCapacity: concurrentCapacity ? parseInt(concurrentCapacity) : 1,
      },
    });

    return NextResponse.json(gig, { status: 201 });
  } catch (err) {
    console.error("[POST /api/gigs]", err);
    return NextResponse.json({ error: "Failed to create gig" }, { status: 500 });
  }
}
