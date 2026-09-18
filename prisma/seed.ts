import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SAMPLE_GIGS = [
  {
    creatorName: "Alex Rivera",
    title: "I'll edit your YouTube video in 24 hours with viral-worthy cuts",
    category: "Video Editing",
    rate: 75,
    description:
      "Professional video editor with 5 years of YouTube experience. Specializing in fast-paced cuts, color grading, sound design, and thumbnails. Delivered 200+ videos for channels ranging from 10K to 2M subscribers. Turnaround: 24 hours for videos up to 20 minutes.",
    concurrentCapacity: 3,
  },
  {
    creatorName: "Maya Chen",
    title: "Scroll-stopping YouTube thumbnail designs that boost your CTR",
    category: "Thumbnail Design",
    rate: 45,
    description:
      "I design thumbnails that get clicks. Average CTR improvement of 40% across my clients' channels. I study what works and apply proven patterns — bold fonts, high contrast, and faces that create curiosity. Delivery in 12 hours.",
    concurrentCapacity: 5,
  },
  {
    creatorName: "Jordan Kim",
    title: "Professional podcast editing — clean, crisp, ready to publish",
    category: "Podcast Editing",
    rate: 60,
    description:
      "Remove ums, ahs, and long silences. Add intro/outro music, normalize audio, and export in your preferred format. I work with Riverside, Zoom, and raw recordings. Standard episodes (60 min) delivered within 48 hours.",
    concurrentCapacity: 4,
  },
  {
    creatorName: "Sam Torres",
    title: "TikTok & Shorts growth strategy — from 0 to 10K in 90 days",
    category: "TikTok/Shorts Growth",
    rate: 120,
    description:
      "I've helped 15 creators hit 10K–100K followers on TikTok and YouTube Shorts. I analyze your niche, create a content calendar, coach on hooks, pacing, and trending sounds. Weekly 1-hour strategy calls included.",
    concurrentCapacity: 2,
  },
  {
    creatorName: "Priya Patel",
    title: "Brand deal negotiation help — get paid what you're worth",
    category: "Brand Deal Negotiation Help",
    rate: 150,
    description:
      "Ex-talent manager. I've negotiated $500K+ in brand deals for creators. I'll audit your rate card, review contracts, handle counter-offers, and coach you on deliverables. One-time or ongoing retainer options.",
    concurrentCapacity: 2,
  },
  {
    creatorName: "Chris Walker",
    title: "Discord & community management — keep your fans engaged daily",
    category: "Discord/Community Management",
    rate: 35,
    description:
      "Full-time community manager for creator Discord servers. Moderation, welcome flows, engagement events, and weekly reports. Available 7 days a week. Experience with servers from 100 to 50,000 members.",
    concurrentCapacity: 6,
  },
  {
    creatorName: "Elena Russo",
    title: "Newsletter writing that converts — from draft to send in 48h",
    category: "Newsletter Writing",
    rate: 85,
    description:
      "Ghostwrite your weekly or bi-weekly creator newsletter. I research, write, edit, and format for Beehiiv, ConvertKit, or Substack. Average open rate of 42% across client newsletters. Includes 1 revision.",
    concurrentCapacity: 4,
  },
  {
    creatorName: "Devon Brooks",
    title: "Warm, professional voiceover for your YouTube ads and intros",
    category: "Voiceover",
    rate: 55,
    description:
      "Studio-quality voiceover with a Rode NT1 and dedicated recording space. Warm, conversational tone perfect for YouTube ads, course intros, and explainer videos. Up to 500 words per session, delivered in 24 hours.",
    concurrentCapacity: 8,
  },
];

async function main() {
  console.log("🌱 Seeding SkillSwap database...");

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.gig.deleteMany();

  // Create gigs
  const createdGigs = await Promise.all(
    SAMPLE_GIGS.map((gig) =>
      prisma.gig.create({ data: gig, include: { bookings: true } })
    )
  );

  // Add some bookings to make trust scores interesting
  const bookingData = [
    { gigIdx: 0, clientName: "Taylor Swift", status: "Accepted" as const },
    { gigIdx: 0, clientName: "Jamie Lee", status: "Accepted" as const },
    { gigIdx: 0, clientName: "Morgan Fox", status: "Accepted" as const },
    { gigIdx: 0, clientName: "Casey Brown", status: "Pending" as const },
    { gigIdx: 1, clientName: "Robin Hall", status: "Accepted" as const },
    { gigIdx: 1, clientName: "Drew Parker", status: "Accepted" as const },
    { gigIdx: 1, clientName: "Quinn Adams", status: "Accepted" as const },
    { gigIdx: 2, clientName: "Sam Lee", status: "Accepted" as const },
    { gigIdx: 2, clientName: "Jordan Cole", status: "Pending" as const },
    { gigIdx: 3, clientName: "Alex Park", status: "Accepted" as const },
    { gigIdx: 4, clientName: "Chris Moon", status: "Declined" as const, declineReason: "RateMismatch" as const },
    { gigIdx: 5, clientName: "Dana Cruz", status: "Accepted" as const },
    { gigIdx: 6, clientName: "Lex Turner", status: "Pending" as const },
    { gigIdx: 7, clientName: "Phoenix Gray", status: "Accepted" as const },
  ];

  await Promise.all(
    bookingData.map(({ gigIdx, clientName, status, declineReason }) =>
      prisma.booking.create({
        data: {
          gigId: createdGigs[gigIdx].id,
          clientName,
          status,
          declineReason: declineReason ?? null,
        },
      })
    )
  );

  console.log(`✅ Created ${createdGigs.length} gigs and ${bookingData.length} bookings.`);
  console.log("\nSample creator names for testing the dashboard:");
  Array.from(new Set(SAMPLE_GIGS.map((g) => g.creatorName))).forEach((name) =>
    console.log(`  - ${name}`)
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
