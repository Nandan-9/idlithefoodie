"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";

const QUOTES = [
  { text: "People who love to eat are always the best people.", author: "Julia Child" },
  { text: "First we eat, then we do everything else.", author: "M.F.K. Fisher" },
  { text: "One cannot think well, love well, sleep well, if one has not dined well.", author: "Virginia Woolf" },
  { text: "Good food is the foundation of genuine happiness.", author: "Auguste Escoffier" },
  { text: "Life is uncertain. Eat dessert first.", author: "Ernestine Ulmer" },
  { text: "Food is our common ground, a universal experience.", author: "James Beard" },
];

function greeting(hour: number): { label: string; emoji: string } {
  if (hour < 12) return { label: "Good morning", emoji: "☀️" };
  if (hour < 17) return { label: "Good afternoon", emoji: "🌤️" };
  return { label: "Good evening", emoji: "🌙" };
}

export default function GreetingBar() {
  const { profile } = useProfile();
  const username = profile?.username || profile?.name || "there";

  const [quote, setQuote] = useState(QUOTES[0]);
  const [hello, setHello] = useState<{ label: string; emoji: string }>({
    label: "Welcome",
    emoji: "👋",
  });

  useEffect(() => {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    );
    setQuote(QUOTES[dayOfYear % QUOTES.length]);
    setHello(greeting(now.getHours()));
  }, []);

  return (
    <div className="px-4 pt-3 pb-4 bg-white border-b border-[#E5E0F5] sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#6F2DBD] to-[#A85CF0] p-5 text-white">
        {/* Playful blobs */}
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-12 right-10 h-24 w-24 rounded-full bg-[#F5C518]/20" />
        <div className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-white/10" />

        <div className="relative flex items-center gap-2">
          <span className="text-lg">{hello.emoji}</span>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
            {hello.label}
          </p>
        </div>

        <p className="relative mt-1 text-[22px] font-extrabold leading-tight">
          Hey {username}!
        </p>
        <p className="relative mt-0.5 text-sm text-white/80">
          Hungry? Let&apos;s find something delicious nearby.
        </p>

        <div className="relative mt-4 flex gap-2.5 rounded-2xl bg-white/12 p-3 backdrop-blur-sm">
          <span className="text-2xl leading-none text-[#F5C518]">&ldquo;</span>
          <div className="min-w-0">
            <p className="text-[13px] font-medium italic leading-snug text-white">
              {quote.text}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-[#F5C518]">
              — {quote.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
