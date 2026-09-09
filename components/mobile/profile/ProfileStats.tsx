"use client";

import type { Profile } from "@/types/profile";

export default function ProfileStats({ profile }: { profile: Profile }) {
  const tiles: { label: string; value: number; star?: boolean }[] = [
    { label: "Posts", value: profile.total_post },
    { label: "Likes", value: profile.total_likes },
    { label: "Stars", value: profile.total_stars },
    { label: "Rating", value: profile.total_rating, star: true },
  ];

  return (
    <div className="mx-4 flex rounded-[18px] bg-white py-4 shadow-[0_4px_14px_rgba(0,0,0,0.07)]">
      {tiles.map((t, i) => (
        <div key={t.label} className="flex flex-1 items-stretch">
          {i > 0 && <div className="w-px self-center h-9 bg-black/10" />}
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="flex items-center gap-1 text-base font-bold text-[#1A1A1A]">
              {t.star && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#6F2DBD">
                  <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
                </svg>
              )}
              {formatCount(t.value)}
            </span>
            <span className="text-[11px] text-[#555]">{t.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Compact count: `1000 → "1k"`, `1500 → "1.5k"`, `2_000_000 → "2M"`. */
function formatCount(n: number): string {
  const v = n ?? 0;
  if (v >= 1_000_000)
    return `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 1)}k`;
  return String(v);
}
