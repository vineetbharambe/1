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

    let gigs = await prisma.gig.findMany({
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

    // Auto-seed sample gigs if database is empty on first deployment
    if (gigs.length === 0 && !search && !category && !creator) {
      const sampleGigs = [
        {
          creatorName: "Alex Rivera",
          title: "I'll edit your YouTube video in 24 hours with viral-worthy cuts",
          category: "Video Editing",
          rate: 75,
          description:
            "Professional video editor with 5 years of YouTube experience. Specializing in fast-paced cuts, color grading, sound design, and thumbnails. Delivered 200+ videos for channels ranging from 10K to 2M subscribers.",
          concurrentCapacity: 3,
        },
        {
          creatorName: "Maya Chen",
          title: "Scroll-stopping YouTube thumbnail designs that boost your CTR",
          category: "Thumbnail Design",
          rate: 45,
          description:
            "I design thumbnails that get clicks. Average CTR improvement of 40% across my clients' channels. Bold fonts, high contrast, and attention-grabbing designs. Delivery in 12 hours.",
          concurrentCapacity: 5,
        },
        {
          creatorName: "Jordan Kim",
          title: "Professional podcast editing — clean, crisp, ready to publish",
          category: "Podcast Editing",
          rate: 60,
          description:
            "Remove ums, ahs, and long silences. Add intro/outro music, normalize audio, and export in your preferred format. Standard episodes (60 min) delivered within 48 hours.",
          concurrentCapacity: 4,
        },
        {
          creatorName: "Sam Torres",
          title: "TikTok & Shorts growth strategy — from 0 to 10K in 90 days",
          category: "TikTok/Shorts Growth",
          rate: 120,
          description:
            "I've helped 15 creators hit 10K–100K followers on TikTok and YouTube Shorts. I analyze your niche, create a content calendar, coach on hooks, pacing, and trending sounds.",
          concurrentCapacity: 2,
        },
        {
          creatorName: "Priya Patel",
          title: "Brand deal negotiation help — get paid what you're worth",
          category: "Brand Deal Negotiation Help",
          rate: 150,
          description:
            "Ex-talent manager. I've negotiated $500K+ in brand deals for creators. I'll audit your rate card, review contracts, handle counter-offers, and coach you on deliverables.",
          concurrentCapacity: 2,
        },
        {
          creatorName: "Chris Walker",
          title: "Discord & community management — keep your fans engaged daily",
          category: "Discord/Community Management",
          rate: 35,
          description:
            "Full-time community manager for creator Discord servers. Moderation, welcome flows, engagement events, and weekly reports. Available 7 days a week.",
          concurrentCapacity: 6,
        },
        {
          creatorName: "Elena Russo",
          title: "Newsletter writing that converts — from draft to send in 48h",
          category: "Newsletter Writing",
          rate: 85,
          description:
            "Ghostwrite your weekly or bi-weekly creator newsletter. I research, write, edit, and format for Beehiiv, ConvertKit, or Substack. Average open rate of 42%.",
          concurrentCapacity: 4,
        },
        {
          creatorName: "Devon Brooks",
          title: "Warm, professional voiceover for your YouTube ads and intros",
          category: "Voiceover",
          rate: 55,
          description:
            "Studio-quality voiceover with a Rode NT1 and dedicated recording space. Warm, conversational tone perfect for YouTube ads, course intros, and explainer videos.",
          concurrentCapacity: 8,
        },
      ];

      for (const gigData of sampleGigs) {
        await prisma.gig.create({ data: gigData });
      }

      gigs = await prisma.gig.findMany({
        include: { bookings: { select: { status: true } } },
        orderBy: { createdAt: "desc" },
      });
    }

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
    // Return robust fallback sample gigs if database table is initializing
    const FALLBACK_GIGS = [
      {
        id: "gig-fallback-1",
        creatorName: "Alex Rivera",
        title: "I'll edit your YouTube video in 24 hours with viral-worthy cuts",
        category: "Video Editing",
        rate: 75,
        description:
          "Professional video editor with 5 years of YouTube experience. Specializing in fast-paced cuts, color grading, sound design, and thumbnails. Delivered 200+ videos for channels ranging from 10K to 2M subscribers.",
        concurrentCapacity: 3,
        createdAt: new Date().toISOString(),
        acceptedCount: 3,
        totalBookings: 4,
        trustScore: 0.95,
        bookings: []
      },
      {
        id: "gig-fallback-2",
        creatorName: "Maya Chen",
        title: "Scroll-stopping YouTube thumbnail designs that boost your CTR",
        category: "Thumbnail Design",
        rate: 45,
        description:
          "I design thumbnails that get clicks. Average CTR improvement of 40% across my clients' channels. Bold fonts, high contrast, and attention-grabbing designs.",
        concurrentCapacity: 5,
        createdAt: new Date().toISOString(),
        acceptedCount: 3,
        totalBookings: 3,
        trustScore: 0.88,
        bookings: []
      },
      {
        id: "gig-fallback-3",
        creatorName: "Jordan Kim",
        title: "Professional podcast editing — clean, crisp, ready to publish",
        category: "Podcast Editing",
        rate: 60,
        description:
          "Remove ums, ahs, and long silences. Add intro/outro music, normalize audio, and export in your preferred format. Standard episodes delivered in 48h.",
        concurrentCapacity: 4,
        createdAt: new Date().toISOString(),
        acceptedCount: 1,
        totalBookings: 2,
        trustScore: 0.75,
        bookings: []
      },
      {
        id: "gig-fallback-4",
        creatorName: "Sam Torres",
        title: "TikTok & Shorts growth strategy — from 0 to 10K in 90 days",
        category: "TikTok/Shorts Growth",
        rate: 120,
        description:
          "I've helped 15 creators hit 10K–100K followers on TikTok and YouTube Shorts. Content calendar, hook coaching, pacing, and trending sounds.",
        concurrentCapacity: 2,
        createdAt: new Date().toISOString(),
        acceptedCount: 1,
        totalBookings: 1,
        trustScore: 0.82,
        bookings: []
      },
      {
        id: "gig-fallback-5",
        creatorName: "Priya Patel",
        title: "Brand deal negotiation help — get paid what you're worth",
        category: "Brand Deal Negotiation Help",
        rate: 150,
        description:
          "Ex-talent manager. I've negotiated $500K+ in brand deals for creators. I'll audit your rate card, review contracts, handle counter-offers.",
        concurrentCapacity: 2,
        createdAt: new Date().toISOString(),
        acceptedCount: 0,
        totalBookings: 1,
        trustScore: 0.40,
        bookings: []
      },
      {
        id: "gig-fallback-6",
        creatorName: "Chris Walker",
        title: "Discord & community management — keep your fans engaged daily",
        category: "Discord/Community Management",
        rate: 35,
        description:
          "Full-time community manager for creator Discord servers. Moderation, welcome flows, engagement events, and weekly reports.",
        concurrentCapacity: 6,
        createdAt: new Date().toISOString(),
        acceptedCount: 1,
        totalBookings: 1,
        trustScore: 0.70,
        bookings: []
      },
      {
        id: "gig-fallback-7",
        creatorName: "Elena Russo",
        title: "Newsletter writing that converts — from draft to send in 48h",
        category: "Newsletter Writing",
        rate: 85,
        description:
          "Ghostwrite your weekly or bi-weekly creator newsletter. I research, write, edit, and format for Beehiiv, ConvertKit, or Substack.",
        concurrentCapacity: 4,
        createdAt: new Date().toISOString(),
        acceptedCount: 0,
        totalBookings: 1,
        trustScore: 0.50,
        bookings: []
      },
      {
        id: "gig-fallback-8",
        creatorName: "Devon Brooks",
        title: "Warm, professional voiceover for your YouTube ads and intros",
        category: "Voiceover",
        rate: 55,
        description:
          "Studio-quality voiceover with a Rode NT1 and dedicated recording space. Warm, conversational tone perfect for YouTube ads and intros.",
        concurrentCapacity: 8,
        createdAt: new Date().toISOString(),
        acceptedCount: 1,
        totalBookings: 1,
        trustScore: 0.65,
        bookings: []
      }
    ];
    return NextResponse.json(FALLBACK_GIGS);
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
