"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Users,
  Star,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { CATEGORY_EMOJI, STATUS_COLORS, STATUS_LABELS, type BookingStatus } from "@/lib/constants";

interface Gig {
  id: string;
  title: string;
  creatorName: string;
  category: string;
  rate: number;
  description: string;
  concurrentCapacity: number;
  createdAt: string;
  acceptedCount: number;
  totalBookings: number;
}

interface BookingResult {
  id: string;
  status: BookingStatus;
  clientName: string;
  gigId: string;
}

export default function GigDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [clientName, setClientName] = useState("");
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("skillswap_user") ?? "";
    setClientName(name);
  }, []);

  useEffect(() => {
    const fetchGig = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/gigs/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setGig(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchGig();
  }, [id]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast.error("Please set a display name first (top nav).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/gigs/${id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName: clientName.trim(), note: note.trim() || null }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      setBookingResult(data);
      toast.success("Booking request sent! 🚀");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-gray-100 rounded-xl" />
          <div className="h-12 w-2/3 bg-gray-100 rounded-xl" />
          <div className="h-4 w-40 bg-gray-100 rounded-xl" />
          <div className="h-40 w-full bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (notFound || !gig) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gig not found</h1>
        <p className="text-gray-500 mb-6">
          This gig may have been removed or the link is incorrect.
        </p>
        <Link
          href="/"
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          Browse marketplace
        </Link>
      </div>
    );
  }

  const emoji = CATEGORY_EMOJI[gig.category] ?? "✨";
  const ageMs = Date.now() - new Date(gig.createdAt).getTime();
  const isNew = ageMs < 48 * 60 * 60 * 1000;
  const isPopular = gig.acceptedCount >= 3;
  const spotsLeft = Math.max(0, gig.concurrentCapacity - gig.acceptedCount);
  const isFull = spotsLeft === 0;

  if (bookingResult) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
          <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            Booking request sent!
          </h1>
          <p className="text-gray-500 text-sm mb-5">
            Your request for <span className="font-semibold">{gig.title}</span> is{" "}
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                STATUS_COLORS[bookingResult.status as BookingStatus]
              }`}
            >
              {STATUS_LABELS[bookingResult.status as BookingStatus]}
            </span>
            . The creator will review it soon.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/my-bookings"
              id="view-my-bookings-btn"
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              View My Bookings
            </Link>
            <Link
              href="/"
              className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Browse More Gigs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link
        href="/"
        id="gig-back-link"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Gig details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category + pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              {emoji} {gig.category}
            </span>
            {isNew && (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                NEW
              </span>
            )}
            {isPopular && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" /> POPULAR
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            {gig.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">
                  {gig.creatorName[0]?.toUpperCase()}
                </span>
              </div>
              <span className="font-medium text-gray-700">{gig.creatorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>
                {gig.totalBookings} booking{gig.totalBookings !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Listed{" "}
                {new Date(gig.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* Description */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">About this gig</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {gig.description}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-indigo-600">${gig.rate}</p>
              <p className="text-xs text-gray-500 mt-0.5">per hour</p>
            </div>
            <div className="bg-violet-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-violet-600">{gig.concurrentCapacity}</p>
              <p className="text-xs text-gray-500 mt-0.5">max slots</p>
            </div>
            <div
              className={`rounded-xl p-4 text-center ${isFull ? "bg-red-50" : "bg-emerald-50"}`}
            >
              <p
                className={`text-2xl font-extrabold ${
                  isFull ? "text-red-500" : "text-emerald-600"
                }`}
              >
                {spotsLeft}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">spots open</p>
            </div>
          </div>
        </div>

        {/* Right: Booking form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-2xl font-extrabold text-gray-900">
                  ${gig.rate}
                  <span className="text-sm text-gray-400 font-normal">/hr</span>
                </p>
                <p
                  className={`text-xs font-semibold mt-0.5 ${
                    isFull ? "text-red-500" : "text-emerald-600"
                  }`}
                >
                  {isFull ? "⚠ Fully booked right now" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} available`}
                </p>
              </div>
            </div>

            {isFull && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  This gig is at capacity, but you can still send a request — the creator may waitlist you.
                </p>
              </div>
            )}

            <form onSubmit={handleBook} noValidate className="space-y-4" id="booking-form">
              <div>
                <label
                  htmlFor="booking-client-name"
                  className="block text-xs font-semibold text-gray-700 mb-1.5"
                >
                  Your Name
                </label>
                <input
                  id="booking-client-name"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Display name"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label
                  htmlFor="booking-note"
                  className="block text-xs font-semibold text-gray-700 mb-1.5"
                >
                  Note / Message{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="booking-note"
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    setNoteError("");
                  }}
                  rows={3}
                  placeholder="Tell the creator what you need, your timeline, etc."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                {noteError && <p className="text-red-500 text-xs mt-1">{noteError}</p>}
              </div>

              <button
                id="submit-booking-btn"
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl py-3 text-sm font-bold hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send Booking Request →"
                )}
              </button>
              <p className="text-center text-xs text-gray-400">
                No payment required. Creator reviews your request.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
