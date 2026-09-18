"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { CATEGORY_EMOJI, DECLINE_REASONS, STATUS_COLORS, STATUS_LABELS, type BookingStatus } from "@/lib/constants";
import EmptyState from "@/components/EmptyState";

interface Booking {
  id: string;
  clientName: string;
  note: string | null;
  status: BookingStatus;
  declineReason: string | null;
  requestedAt: string;
}

interface GigWithBookings {
  id: string;
  title: string;
  category: string;
  rate: number;
  concurrentCapacity: number;
  createdAt: string;
  bookings: Booking[];
  acceptedCount: number;
}

function DeclineModal({
  bookingId,
  onClose,
  onDeclined,
}: {
  bookingId: string;
  onClose: () => void;
  onDeclined: (bookingId: string, reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDecline = async () => {
    if (!reason) {
      setReasonError("Please select a reason.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline", reason }),
      });
      if (!res.ok) throw new Error("Failed to decline");
      onDeclined(bookingId, reason);
      toast.success("Booking declined.");
      onClose();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" id="decline-modal">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-in">
        <h3 className="font-bold text-gray-900 mb-1">Decline booking</h3>
        <p className="text-sm text-gray-500 mb-4">Select a reason — the client will see this.</p>

        <div className="space-y-2 mb-4">
          {DECLINE_REASONS.map((r) => (
            <label
              key={r.value}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                reason === r.value
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
              id={`decline-reason-${r.value}`}
            >
              <input
                type="radio"
                name="decline-reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => {
                  setReason(r.value);
                  setReasonError("");
                }}
                className="accent-indigo-600"
              />
              <span className="text-sm font-medium text-gray-700">{r.label}</span>
            </label>
          ))}
        </div>
        {reasonError && <p className="text-red-500 text-xs mb-3">{reasonError}</p>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-200 transition-colors"
            id="decline-cancel-btn"
          >
            Cancel
          </button>
          <button
            onClick={handleDecline}
            disabled={submitting}
            className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
            id="decline-confirm-btn"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

function GigRow({ gig, onUpdate }: { gig: GigWithBookings; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const emoji = CATEGORY_EMOJI[gig.category] ?? "✨";

  const handleAccept = async (bookingId: string) => {
    setProcessing(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });
      const data = await res.json();

      if (res.status === 409 && data.capacityFull) {
        // DP2: Offer waitlist
        const doWaitlist = confirm(
          `Capacity full (${data.concurrentCapacity} slots taken). Waitlist this client instead?`
        );
        if (doWaitlist) {
          await handleWaitlist(bookingId);
        }
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to accept");
      toast.success("Booking accepted! ✓");
      onUpdate();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setProcessing(null);
    }
  };

  const handleWaitlist = async (bookingId: string) => {
    setProcessing(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "waitlist" }),
      });
      if (!res.ok) throw new Error("Failed to waitlist");
      toast.success("Booking waitlisted.");
      onUpdate();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setProcessing(null);
    }
  };

  const handleDeclined = () => {
    onUpdate();
  };

  const pendingCount = gig.bookings.filter((b) => b.status === "Pending").length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Gig header */}
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
        id={`gig-expand-${gig.id}`}
      >
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            {emoji}
          </div>
          <div>
            <p className="font-bold text-gray-900">{gig.title}</p>
            <p className="text-xs text-gray-400">
              ${gig.rate}/hr · {gig.concurrentCapacity} slot{gig.concurrentCapacity !== 1 ? "s" : ""} · {gig.acceptedCount}/{gig.concurrentCapacity} accepted
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {pendingCount} pending
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Bookings list */}
      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {gig.bookings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm">No bookings yet. Share your gig!</p>
            </div>
          ) : (
            gig.bookings.map((booking) => (
              <div key={booking.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3" id={`booking-row-${booking.id}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{booking.clientName}</p>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        STATUS_COLORS[booking.status]
                      }`}
                    >
                      {STATUS_LABELS[booking.status]}
                    </span>
                  </div>
                  {booking.note && (
                    <p className="text-xs text-gray-500 mb-1 italic">&ldquo;{booking.note}&rdquo;</p>
                  )}
                  <p className="text-[11px] text-gray-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(booking.requestedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Actions */}
                {booking.status === "Pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      id={`accept-btn-${booking.id}`}
                      onClick={() => handleAccept(booking.id)}
                      disabled={!!processing}
                      className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-60"
                    >
                      {processing === booking.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      Accept
                    </button>
                    <button
                      id={`decline-btn-${booking.id}`}
                      onClick={() => setDecliningId(booking.id)}
                      disabled={!!processing}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-60"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Decline
                    </button>
                    <button
                      id={`waitlist-btn-${booking.id}`}
                      onClick={() => handleWaitlist(booking.id)}
                      disabled={!!processing}
                      className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-60"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Waitlist
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Decline modal */}
      {decliningId && (
        <DeclineModal
          bookingId={decliningId}
          onClose={() => setDecliningId(null)}
          onDeclined={handleDeclined}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [creatorName, setCreatorName] = useState("");
  const [gigs, setGigs] = useState<GigWithBookings[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async (name: string) => {
    setLoading(true);
    try {
      // Fetch only this creator's gigs using the ?creator= filter
      const res = await fetch(`/api/gigs?creator=${encodeURIComponent(name)}`);
      const myGigs = await res.json();

      // Fetch bookings for each gig
      const gigsWithBookings = await Promise.all(
        (Array.isArray(myGigs) ? myGigs : []).map(async (gig: GigWithBookings) => {
          const bRes = await fetch(`/api/gigs/${gig.id}/bookings`);
          const bData = await bRes.json();
          return {
            ...gig,
            bookings: bData.bookings ?? [],
            acceptedCount: bData.acceptedCount ?? 0,
          };
        })
      );

      setGigs(gigsWithBookings);
    } catch {
      setGigs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const name = localStorage.getItem("skillswap_user") ?? "";
    setCreatorName(name);
    if (name) fetchDashboard(name);
    else setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPending = gigs.reduce(
    (sum, g) => sum + g.bookings.filter((b) => b.status === "Pending").length,
    0
  );
  const totalAccepted = gigs.reduce(
    (sum, g) => sum + g.bookings.filter((b) => b.status === "Accepted").length,
    0
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Creator Dashboard</h1>
          {creatorName && (
            <p className="text-gray-500 text-sm mt-1">
              Welcome back, <span className="font-semibold text-indigo-600">{creatorName}</span>
            </p>
          )}
        </div>
        <Link
          href="/gigs/new"
          id="dashboard-post-gig-btn"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Post New Gig
        </Link>
      </div>

      {/* Stats */}
      {gigs.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-gray-900">{gigs.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Active Gigs</p>
          </div>
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 text-center">
            <p className="text-2xl font-extrabold text-amber-600">{totalPending}</p>
            <p className="text-xs text-gray-500 mt-0.5">Pending</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4 text-center">
            <p className="text-2xl font-extrabold text-emerald-600">{totalAccepted}</p>
            <p className="text-xs text-gray-500 mt-0.5">Accepted</p>
          </div>
        </div>
      )}

      {/* Content */}
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
      ) : !creatorName ? (
        <EmptyState
          icon="👤"
          title="Set your display name"
          description="Use the top nav to set a creator name, then come back to manage your gigs."
        />
      ) : gigs.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No gigs yet"
          description="Post your first gig and start getting bookings from clients."
          action={
            <Link
              href="/gigs/new"
              id="empty-post-gig-btn"
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Post Your First Gig
            </Link>
          }
        />
      ) : (
        <div className="space-y-4" id="gigs-list">
          {gigs.map((gig) => (
            <GigRow
              key={gig.id}
              gig={gig}
              onUpdate={() => fetchDashboard(creatorName)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
