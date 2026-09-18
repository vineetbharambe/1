"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

interface FormData {
  title: string;
  category: string;
  rate: string;
  description: string;
  concurrentCapacity: string;
}

interface FormErrors {
  title?: string;
  category?: string;
  rate?: string;
  description?: string;
  concurrentCapacity?: string;
}

export default function PostGigPage() {
  const router = useRouter();
  const [creatorName, setCreatorName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>({
    title: "",
    category: "",
    rate: "",
    description: "",
    concurrentCapacity: "1",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const name = localStorage.getItem("skillswap_user");
    if (name) setCreatorName(name);
  }, []);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.title.trim()) errs.title = "Title is required";
    else if (form.title.trim().length < 10) errs.title = "Title must be at least 10 characters";
    if (!form.category) errs.category = "Please select a category";
    if (!form.rate) errs.rate = "Rate is required";
    else if (isNaN(Number(form.rate)) || Number(form.rate) <= 0)
      errs.rate = "Rate must be a positive number";
    if (!form.description.trim()) errs.description = "Description is required";
    else if (form.description.trim().length < 30)
      errs.description = "Description must be at least 30 characters";
    if (form.concurrentCapacity) {
      const cap = parseInt(form.concurrentCapacity);
      if (isNaN(cap) || cap < 1) errs.concurrentCapacity = "Capacity must be at least 1";
      if (cap > 100) errs.concurrentCapacity = "Capacity cannot exceed 100";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!creatorName) {
      toast.error("Please set a display name first (top-right of the page).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/gigs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorName,
          title: form.title.trim(),
          category: form.category,
          rate: parseFloat(form.rate),
          description: form.description.trim(),
          concurrentCapacity: parseInt(form.concurrentCapacity) || 1,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post gig");
      }

      toast.success("Gig posted! 🎉");
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? "border-red-300 focus:ring-red-200"
        : "border-gray-200 focus:ring-indigo-200 focus:border-indigo-400"
    }`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Back */}
      <Link
        href="/"
        id="back-to-browse"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to marketplace
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Post a Gig</h1>
        <p className="text-gray-500 text-sm">
          Posting as{" "}
          <span className="font-semibold text-indigo-600">{creatorName || "..."}</span>
          {!creatorName && (
            <span className="text-red-400 ml-2">
              — set a display name first (top nav)
            </span>
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="gig-title" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Gig Title <span className="text-red-400">*</span>
          </label>
          <input
            id="gig-title"
            type="text"
            value={form.title}
            onChange={update("title")}
            placeholder="e.g. I'll edit your YouTube video in 24 hours"
            className={inputClass("title")}
            maxLength={120}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="gig-category" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Category <span className="text-red-400">*</span>
          </label>
          <select
            id="gig-category"
            value={form.category}
            onChange={update("category")}
            className={inputClass("category")}
          >
            <option value="">Select a category…</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.label} value={cat.label}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">{errors.category}</p>
          )}
        </div>

        {/* Rate */}
        <div>
          <label htmlFor="gig-rate" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Hourly Rate (USD) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
              $
            </span>
            <input
              id="gig-rate"
              type="number"
              value={form.rate}
              onChange={update("rate")}
              placeholder="50"
              min="1"
              step="0.01"
              className={`${inputClass("rate")} pl-8`}
            />
          </div>
          {errors.rate && (
            <p className="text-red-500 text-xs mt-1">{errors.rate}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="gig-description"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            id="gig-description"
            value={form.description}
            onChange={update("description")}
            rows={5}
            placeholder="Describe what you offer, your experience, turnaround time, what the client gets…"
            className={`${inputClass("description")} resize-none`}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-red-500 text-xs">{errors.description}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-gray-300 ml-auto">
              {form.description.length} chars
            </span>
          </div>
        </div>

        {/* Advanced toggle */}
        <div>
          <button
            type="button"
            id="toggle-advanced"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Advanced options
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
              <label
                htmlFor="gig-capacity"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Concurrent Capacity
                <span className="font-normal text-gray-400 ml-2">(how many clients at once)</span>
              </label>
              <input
                id="gig-capacity"
                type="number"
                value={form.concurrentCapacity}
                onChange={update("concurrentCapacity")}
                min="1"
                max="100"
                className={inputClass("concurrentCapacity")}
              />
              {errors.concurrentCapacity && (
                <p className="text-red-500 text-xs mt-1">{errors.concurrentCapacity}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Default is 1. If you can handle multiple clients simultaneously, increase this.
                You can accept bookings up to this limit; additional requests can be waitlisted.
              </p>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            id="submit-gig-btn"
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl py-3.5 text-sm font-bold hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Posting…
              </>
            ) : (
              "Post Gig →"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
