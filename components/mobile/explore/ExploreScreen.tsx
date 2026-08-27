"use client";

import { useState } from "react";
import Link from "next/link";
import { useHotels } from "@/hooks/useHotels";
import AppShell from "@/components/mobile/AppShell";
import StorefrontIcon from "./StorefrontIcon";

export default function ExploreScreen() {
  const { hotels, loading, error, refresh } = useHotels();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q
    ? hotels.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q)
      )
    : hotels;

  return (
    <AppShell active="explore">
      <header className="relative overflow-hidden rounded-b-[28px] bg-linear-to-br from-[#6F2DBD] to-[#A85CF0] px-5 pb-6 pt-5 text-white">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-white/10" />
        <p className="relative text-xs font-semibold uppercase tracking-wider text-white/70">
          Find your next bite
        </p>
        <h1 className="relative mt-1 text-[26px] font-extrabold leading-tight">
          Explore places 🍽️
        </h1>

        <div className="relative mt-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg shadow-black/10 ring-2 ring-transparent transition focus-within:ring-[#F5C518]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6F2DBD"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, address or city"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[15px] text-[#333] placeholder-[#BBB] outline-none"
          />
        </div>
      </header>

      {loading && hotels.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
        </div>
      )}

      {error && hotels.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-[#555] text-sm">{error}</p>
          <button
            onClick={refresh}
            className="rounded-2xl bg-[#6F2DBD] text-white font-bold text-sm px-6 py-3 active:scale-95 transition-transform"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <span className="text-4xl">🔍</span>
          <p className="text-[#1A1A1A] font-bold text-lg">No hotels found</p>
          <p className="text-[#888] text-sm">Try a different search.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex flex-col gap-3 px-4 py-4">
          {!q && (
            <p className="flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-[#9B8DC4]">
              <span className="h-2 w-2 rounded-full bg-[#F5C518]" />
              {filtered.length} {filtered.length === 1 ? "place" : "places"} to discover
            </p>
          )}
          {filtered.map((h) => (
              <Link
                key={h.id}
                href={`/explore/${h.id}`}
                className="group flex items-center gap-3.5 rounded-2xl border border-[#EEE9FA] bg-white p-3 shadow-sm shadow-[#6F2DBD]/5 transition-transform active:scale-[0.98]"
              >
                <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#6F2DBD] to-[#A85CF0]">
                  <StorefrontIcon size={30} color="#FFFFFF" />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#F5C518]">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#1A1A1A" stroke="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                    </svg>
                  </span>
                </span>
                <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 overflow-hidden">
                  <span className="w-full truncate text-[15px] font-bold text-[#1A1A1A]">
                    {h.name}
                  </span>
                  <span className="flex w-full items-center gap-1 text-xs text-[#888]">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#C4B8E0"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="truncate">
                      {[h.address, h.city].filter(Boolean).join(", ")}
                    </span>
                  </span>
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F8F5FF]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6F2DBD"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
