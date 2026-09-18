import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SkillSwap — Where creators cash in on what they know.",
  description:
    "SkillSwap is a creator gig marketplace. Browse, book, or sell your skills — no signup required. Video editing, thumbnails, podcast editing, TikTok growth, and more.",
  keywords: [
    "creator marketplace",
    "gig economy",
    "freelance creators",
    "video editing",
    "thumbnail design",
    "podcast editing",
    "TikTok growth",
  ],
  openGraph: {
    title: "SkillSwap — Creator Gig Marketplace",
    description: "Where creators cash in on what they know. No signup required.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#FAF8F5] text-gray-900 antialiased min-h-screen">
        <Navbar />
        <main>{children}</main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1e1b4b",
              color: "#fff",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#a78bfa", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#f87171", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
