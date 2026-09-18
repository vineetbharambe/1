"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, TrendingUp } from "lucide-react";
import GigCard from "@/components/GigCard";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";
import { CATEGORIES } from "@/lib/constants";

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
  trustScore?: number | null;
}

const SORT_OPTIONS = [
  { value: "trust", label: "Trust Score ✦" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "trust");

  const fetchGigs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (sort) params.set("sort", sort);
      const res = await fetch(`/api/gigs?${params.toString()}`);
      const data = await res.json();
      setGigs(Array.isArray(data) ? data : []);
    } catch {
      setGigs([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (sort !== "trust") params.set("sort", sort);
    router.replace(`/?${params.toString()}`, { scroll: false });
  }, [search, category, sort, router]);

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">
            Where creators cash in
            <br />
            <span className="text-violet-200">on what they know.</span>
          </h1>
          <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
            Book top creator talent — or sell your skills — instantly. No signup, ever.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300 pointer-events-none" />
            <input
              id="marketplace-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gigs by title or description…"
              className="w-full bg-white/15 backdrop-blur text-white placeholder-indigo-200 border border-white/20 rounded-2xl pl-11 pr-10 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-200 hover:text-white transition-colors"
                id="clear-search-btn"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-[#FAF8F5]/95 backdrop-blur border-b border-gray-100 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Category chips */}
          <div className="flex items-center gap-2 flex-wrap flex-1" id="category-filter">
            <button
              id="cat-all"
              onClick={() => setCategory("")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                !category
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-200 hover:text-indigo-600"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                id={`cat-${cat.label.replace(/\W/g, "-")}`}
                onClick={() => setCategory(category === cat.label ? "" : cat.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  category === cat.label
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-200 hover:text-indigo-600"
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gig Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active filters display */}
        {(search || category) && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="text-sm text-gray-500">Filtered by:</span>
            {search && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
                &ldquo;{search}&rdquo;
                <button onClick={() => setSearch("")} className="hover:text-indigo-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {CATEGORIES.find((c) => c.label === category)?.emoji} {category}
                <button onClick={() => setCategory("")} className="hover:text-violet-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : gigs.length === 0 ? (
          <EmptyState
            icon="🧐"
            title="No gigs found"
            description={
              search || category
                ? "Try adjusting your search or removing a filter."
                : "Be the first! Switch to Creator mode and post your skills."
            }
            action={
              search || category ? (
                <button
                  id="clear-filters-btn"
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                  }}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {gigs.length} gig{gigs.length !== 1 ? "s" : ""} found
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {gigs.map((gig) => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
