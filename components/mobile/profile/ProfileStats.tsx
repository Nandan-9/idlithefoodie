"use client";

import type { Profile } from "@/types/profile";

export default function ProfileStats({ profile }: { profile: Profile }) {
  const tiles: { label: string; value: number }[] = [
    { label: "Posts", value: profile.total_post },
    { label: "Likes", value: profile.total_likes },
    { label: "Stars", value: profile.total_stars },
    { label: "Rating", value: profile.total_rating },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 px-4 py-4 sm:grid-cols-4 sm:gap-3 sm:px-6">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="flex flex-col items-center rounded-2xl bg-white border border-[#E5E0F5] py-3 sm:py-4"
        >
          <span className="text-[#1A1A1A] font-extrabold text-lg sm:text-xl">
            {formatCount(t.value)}
          </span>
          <span className="text-[#888] text-[11px] font-medium">{t.label}</span>
        </div>
      ))}
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n ?? 0);
}
