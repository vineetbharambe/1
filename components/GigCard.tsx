"use client";

import Link from "next/link";
import { Clock, Users, Star } from "lucide-react";
import { CATEGORY_EMOJI, STATUS_COLORS } from "@/lib/constants";

interface GigCardProps {
  gig: {
    id: string;
    title: string;
    creatorName: string;
    category: string;
    rate: number;
    description: string;
    concurrentCapacity: number;
    createdAt: string | Date;
    acceptedCount?: number;
    totalBookings?: number;
  };
}

export default function GigCard({ gig }: GigCardProps) {
  const emoji = CATEGORY_EMOJI[gig.category] ?? "✨";
  const ageMs = Date.now() - new Date(gig.createdAt).getTime();
  const isNew = ageMs < 48 * 60 * 60 * 1000;
  const isPopular = (gig.acceptedCount ?? 0) >= 3;
  const accepted = gig.acceptedCount ?? 0;
  const capacity = gig.concurrentCapacity;
  const spotsLeft = Math.max(0, capacity - accepted);
  const isFull = spotsLeft === 0;

  return (
    <Link href={`/gigs/${gig.id}`} className="block group" id={`gig-card-${gig.id}`}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group-hover:border-indigo-100">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
              {emoji}
            </div>
            <div>
              <p className="text-xs text-indigo-600 font-medium">{gig.category}</p>
              <p className="text-xs text-gray-400">by {gig.creatorName}</p>
            </div>
          </div>
          {/* Pills */}
          <div className="flex flex-col items-end gap-1">
            {isNew && (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                NEW
              </span>
            )}
            {isPopular && (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5" /> POPULAR
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2">
          {gig.title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm line-clamp-2 flex-1">{gig.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-indigo-600 font-bold text-base">
              ${gig.rate}
              <span className="text-gray-400 font-normal text-xs">/hr</span>
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Users className="w-3 h-3" />
              <span>
                {capacity === 1
                  ? "Solo"
                  : `${capacity} slots`}
              </span>
            </div>
          </div>
          {/* Availability badge */}
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              isFull
                ? "bg-red-50 text-red-600"
                : spotsLeft <= 1
                ? "bg-amber-50 text-amber-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isFull ? "bg-red-400" : spotsLeft <= 1 ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
            {isFull ? "Full" : spotsLeft === 1 ? "1 spot left" : `${spotsLeft} open`}
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 text-[11px] text-gray-300">
          <Clock className="w-3 h-3" />
          <span>
            {new Date(gig.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
