"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";

function greeting(hour: number): { label: string; emoji: string } {
  if (hour < 12) return { label: "Good morning", emoji: "☀️" };
  if (hour < 17) return { label: "Good afternoon", emoji: "🌤️" };
  return { label: "Good evening", emoji: "🌙" };
}

export default function GreetingBar() {
  const { profile } = useProfile();
  const username = profile?.username || profile?.name || "there";

  const [hello, setHello] = useState<{ label: string; emoji: string }>({
    label: "Welcome",
    emoji: "👋",
  });

  useEffect(() => {
    setHello(greeting(new Date().getHours()));
  }, []);

  return (
    <div className="px-4 pt-2 pb-3 bg-white border-b border-[#E5E0F5] sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#6F2DBD] to-[#A85CF0] p-4 text-white">
        {/* Playful blob */}
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />

        <div className="relative flex items-center gap-2">
          <span className="text-lg">{hello.emoji}</span>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
            {hello.label}
          </p>
        </div>

        <p className="relative mt-1 text-[19px] font-extrabold leading-tight">
          Hey {username}!
        </p>
        <p className="relative mt-0.5 text-sm text-white/80">
          Hungry? Let&apos;s find something delicious nearby.
        </p>
      </div>
    </div>
  );
}
