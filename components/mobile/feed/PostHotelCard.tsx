"use client";

import Link from "next/link";
import type { Post } from "@/types/feed";

type Props = {
  post: Post;
};

export default function PostHotelCard({ post }: Props) {
  const hotel = post.hotel;
  if (!hotel) return null;

  const rating = hotel.average_rating ?? 0;
  const href = `/explore/${hotel.id}`;

  return (
    <div className="absolute bottom-3 left-3 right-3 flex items-stretch gap-2">
      <Link
        href={href}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-white/15 bg-black/45 px-3 py-2 text-white backdrop-blur-md active:opacity-90"
      >
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#6F2DBD]">
          <StoreIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold leading-tight">{hotel.name}</p>
          <p className="truncate text-[11px] leading-tight text-white/70">
            {hotel.address}
          </p>
        </div>
      </Link>

      <Link
        href={href}
        className="flex flex-shrink-0 items-center gap-1 rounded-2xl bg-[#F5D90A] py-2 pl-3 pr-1.5 text-[#1A1A1A] active:opacity-90"
      >
        <span className="flex flex-col items-center leading-none">
          <span className="flex items-center gap-1 text-sm font-extrabold">
            <StarIcon />
            {rating.toFixed(1)}
          </span>
          <span className="mt-0.5 text-[9px] font-medium">
            {hotel.rating_count} reviews
          </span>
        </span>
        <ChevronIcon />
      </Link>
    </div>
  );
}

function StoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l1.5-5.5A1 1 0 0 1 5.46 3h13.08a1 1 0 0 1 .96.5L21 9" />
      <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
      <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#1A1A1A" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
