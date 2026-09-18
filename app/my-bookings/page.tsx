"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ExternalLink } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { CATEGORY_EMOJI, DECLINE_REASONS, STATUS_COLORS, STATUS_LABELS, type BookingStatus } from "@/lib/constants";

interface BookingWithGig {
  id: string;
  status: BookingStatus;
  note: string | null;
  declineReason: string | null;
  requestedAt: string;
  gig: {
    id: string;
    title: string;
    category: string;
    rate: number;
    creatorName: string;
  };
}

const STATUS_ORDER: BookingStatus[] = ["Pending", "Accepted", "Waitlisted", "Declined"];

const STATUS_SECTION_TITLES: Record<BookingStatus, string> = {
  Pending: "⏳ Pending Review",
  Accepted: "✅ Accepted",
  Waitlisted: "🔔 Waitlisted",
  Declined: "❌ Declined",
};

function BookingCard({ booking }: { booking: BookingWithGig }) {
  const emoji = CATEGORY_EMOJI[booking.gig.category] ?? "✨";
  const declineLabel = DECLINE_REASONS.find((r) => r.value === booking.declineReason)?.label;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
      id={`my-booking-${booking.id}`}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            {emoji}
          </div>
          <div>
            <Link
              href={`/gigs/${booking.gig.id}`}
              className="font-bold text-gray-900 hover:text-indigo-600 transition-colors text-sm leading-snug line-clamp-2"
              id={`my-booking-gig-link-${booking.id}`}
            >
              {booking.gig.title}
            </Link>
            <p className="text-xs text-gray-400 mt-0.5">
              by {booking.gig.creatorName} · ${booking.gig.rate}/hr ·{" "}
              {booking.gig.category}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[booking.status]}`}
        >
          {STATUS_LABELS[booking.status]}
        </span>
      </div>

      {booking.note && (
        <p className="text-xs text-gray-500 mt-3 italic border-l-2 border-indigo-100 pl-3">
          &ldquo;{booking.note}&rdquo;
        </p>
      )}

      {/* DP1: Decline reason + Browse similar */}
      {booking.status === "Declined" && booking.declineReason && (
        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-xs text-red-600 font-semibold mb-1">Reason: {declineLabel}</p>
          <p className="text-xs text-red-500 mb-2">
            {booking.declineReason === "FullyBooked"
              ? "This creator is at capacity right now."
              : booking.declineReason === "NotAFit"
              ? "The creator felt this wasn't the right match."
              : booking.declineReason === "RateMismatch"
              ? "Your budget and the creator's rate didn't align."
              : "The creator declined without further details."}
          </p>
          <Link
            href={`/?category=${encodeURIComponent(booking.gig.category)}`}
            id={`browse-similar-${booking.id}`}
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Browse similar {booking.gig.category} gigs
          </Link>
        </div>
      )}

      <p className="text-[11px] text-gray-300 mt-3 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Requested{" "}
        {new Date(booking.requestedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}

export default function MyBookingsPage() {
  const [clientName, setClientName] = useState("");
  const [bookings, setBookings] = useState<BookingWithGig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = localStorage.getItem("skillswap_user") ?? "";
    setClientName(name);

    if (!name) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await fetch(
          `/api/bookings?client=${encodeURIComponent(name)}`
        );
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const grouped = STATUS_ORDER.reduce<Record<BookingStatus, BookingWithGig[]>>(
    (acc, status) => {
      acc[status] = bookings.filter((b) => b.status === status);
      return acc;
    },
    { Pending: [], Accepted: [], Declined: [], Waitlisted: [] }
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">My Bookings</h1>
        {clientName && (
          <p className="text-sm text-gray-500">
            Showing bookings for{" "}
            <span className="font-semibold text-indigo-600">{clientName}</span>
          </p>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-1/2 bg-gray-100 rounded-full" />
                  <div className="h-3 w-1/4 bg-gray-100 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !clientName ? (
        <EmptyState
          icon="👤"
          title="Set your display name"
          description="Use the top nav to set your name to see your bookings."
        />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No bookings yet"
          description="Browse the marketplace and book a creator to get started."
          action={
            <Link
              href="/"
              id="browse-gigs-empty-btn"
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Browse Gigs
            </Link>
          }
        />
      ) : (
        <div className="space-y-8" id="my-bookings-list">
          {STATUS_ORDER.map((status) =>
            grouped[status].length > 0 ? (
              <section key={status}>
                <h2 className="text-base font-bold text-gray-700 mb-3">
                  {STATUS_SECTION_TITLES[status]}{" "}
                  <span className="text-sm font-normal text-gray-400">
                    ({grouped[status].length})
                  </span>
                </h2>
                <div className="space-y-3">
                  {grouped[status].map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </section>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
