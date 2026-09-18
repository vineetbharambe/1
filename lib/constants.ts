// Category definitions for the SkillSwap creator economy marketplace
export const CATEGORIES = [
  { label: "Video Editing", emoji: "🎬" },
  { label: "Thumbnail Design", emoji: "🖼️" },
  { label: "Podcast Editing", emoji: "🎙️" },
  { label: "TikTok/Shorts Growth", emoji: "📱" },
  { label: "Brand Deal Negotiation Help", emoji: "🤝" },
  { label: "Discord/Community Management", emoji: "💬" },
  { label: "Newsletter Writing", emoji: "✉️" },
  { label: "Voiceover", emoji: "🎤" },
] as const;

export type Category = (typeof CATEGORIES)[number]["label"];

export const CATEGORY_EMOJI: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.label, c.emoji])
);

export const DECLINE_REASONS = [
  { value: "FullyBooked", label: "Fully Booked" },
  { value: "NotAFit", label: "Not a Fit" },
  { value: "RateMismatch", label: "Rate Mismatch" },
  { value: "Other", label: "Other" },
] as const;

export type BookingStatus = "Pending" | "Accepted" | "Declined" | "Waitlisted";

export const STATUS_COLORS: Record<BookingStatus, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Accepted: "bg-emerald-100 text-emerald-800",
  Declined: "bg-red-100 text-red-800",
  Waitlisted: "bg-purple-100 text-purple-800",
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  Pending: "Pending",
  Accepted: "Accepted ✓",
  Declined: "Declined",
  Waitlisted: "Waitlisted",
};

export const INITIAL_SAMPLE_GIGS = [
  {
    id: "gig-1",
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
  },
  {
    id: "gig-2",
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
  },
  {
    id: "gig-3",
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
  },
  {
    id: "gig-4",
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
  },
  {
    id: "gig-5",
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
    trustScore: 0.4,
  },
  {
    id: "gig-6",
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
    trustScore: 0.7,
  },
  {
    id: "gig-7",
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
    trustScore: 0.5,
  },
  {
    id: "gig-8",
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
  },
];
