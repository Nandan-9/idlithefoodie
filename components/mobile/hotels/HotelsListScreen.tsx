"use client";

import Link from "next/link";
import { useHotels } from "@/hooks/useHotels";
import AppShell from "@/components/mobile/AppShell";
import StorefrontIcon from "@/components/mobile/explore/StorefrontIcon";

export default function HotelsListScreen() {
  const { hotels, loading, error, refresh } = useHotels();

  return (
    <AppShell active="hotels">
      <header className="relative overflow-hidden rounded-b-[28px] bg-linear-to-br from-[#6F2DBD] to-[#A85CF0] px-5 pb-6 pt-5 text-white">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-white/10" />
        <p className="relative text-xs font-semibold uppercase tracking-wider text-white/70">
          Where to eat
        </p>
        <h1 className="relative mt-1 text-[26px] font-extrabold leading-tight">
          Hotels 🍴
        </h1>
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

      {!loading && !error && hotels.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <span className="text-4xl">🍽️</span>
          <p className="text-[#1A1A1A] font-bold text-lg">No hotels yet</p>
        </div>
      )}

      {hotels.length > 0 && (
        <div className="flex flex-col gap-2 p-3 pb-24 lg:pb-8">
          {hotels.map((hotel) => (
            <Link
              key={hotel.id}
              href={`/explore/${hotel.id}`}
              className="flex items-center gap-3 rounded-2xl border border-[#E5E0F5] bg-white px-4 py-3 shadow-sm active:scale-[0.98] transition-transform"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F0EAFB]">
                <StorefrontIcon size={24} color="#6F2DBD" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-[#1A1A1A]">{hotel.name}</p>
                <p className="truncate text-sm text-[#888]">
                  {[hotel.address, hotel.city].filter(Boolean).join(", ")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
