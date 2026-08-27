"use client";

import Image from "next/image";

export default function FeedHeader() {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5E0F5] sm:px-6">
      {/* Logo */}
      <Image
        src="/assets/idli-new-Photoroom.png"
        alt="Idli"
        width={64}
        height={28}
        className="object-contain"
        priority
      />

      {/* Top rated pill */}
      <div className="flex items-center gap-1.5 bg-[#F0EAFB] px-3 py-1.5 rounded-full">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="#6F2DBD" stroke="none">
          <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 7.1-1.01z" />
        </svg>
        <span className="text-[#6F2DBD] text-xs font-semibold">Top Rated</span>
      </div>

      {/* Avatar placeholder */}
      <div className="w-8 h-8 rounded-full bg-[#E5E0F5] flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B8DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
    </div>
  );
}
