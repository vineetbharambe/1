"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

type Mode = "creator" | "client";

export default function Navbar() {
  const pathname = usePathname();
  const [mode, setMode] = useState<Mode>("client");
  const [displayName, setDisplayName] = useState<string>("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("skillswap_user");
    const storedMode = localStorage.getItem("skillswap_mode") as Mode | null;
    if (!stored) {
      setShowNamePrompt(true);
    } else {
      setDisplayName(stored);
    }
    if (storedMode) setMode(storedMode);
  }, []);

  const handleSaveName = () => {
    if (!nameInput.trim()) {
      setNameError("Please enter a display name to continue.");
      return;
    }
    localStorage.setItem("skillswap_user", nameInput.trim());
    setDisplayName(nameInput.trim());
    setShowNamePrompt(false);
    setNameError("");
  };

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    localStorage.setItem("skillswap_mode", newMode);
  };

  return (
    <>
      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Welcome to SkillSwap</h2>
                <p className="text-sm text-gray-500">No signup needed — just a name.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Choose a display name to post gigs or book creators. You can always change it later.
            </p>
            <input
              id="display-name-input"
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                setNameError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              placeholder="e.g. Alex Rivera"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
              autoFocus
            />
            {nameError && (
              <p className="text-red-500 text-xs mb-3">{nameError}</p>
            )}
            <button
              id="save-display-name-btn"
              onClick={handleSaveName}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Let&apos;s go →
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" id="nav-logo">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              Skill<span className="text-indigo-600">Swap</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              id="nav-browse"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Browse
            </Link>
            {mode === "creator" && (
              <Link
                href="/gigs/new"
                id="nav-post-gig"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/gigs/new"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Post a Gig
              </Link>
            )}
            <Link
              href={mode === "creator" ? "/dashboard" : "/my-bookings"}
              id="nav-dashboard"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/dashboard" || pathname === "/my-bookings"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {mode === "creator" ? "Dashboard" : "My Bookings"}
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Persona toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1" id="persona-toggle">
              <button
                id="mode-client-btn"
                onClick={() => handleModeSwitch("client")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === "client"
                    ? "bg-white shadow text-indigo-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                I&apos;m a Client
              </button>
              <button
                id="mode-creator-btn"
                onClick={() => handleModeSwitch("creator")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === "creator"
                    ? "bg-white shadow text-violet-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                I&apos;m a Creator
              </button>
            </div>

            {/* Display name */}
            {displayName && (
              <button
                id="display-name-badge"
                onClick={() => {
                  const newName = prompt("Change your display name:", displayName);
                  if (newName?.trim()) {
                    localStorage.setItem("skillswap_user", newName.trim());
                    setDisplayName(newName.trim());
                  }
                }}
                className="hidden sm:flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-1.5 transition-colors"
                title="Click to change name"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {displayName[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                  {displayName}
                </span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
