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
