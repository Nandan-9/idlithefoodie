"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useHotels } from "@/hooks/useHotels";
import { fetchTags, fetchTagHotels } from "@/lib/api";
import type { Hotel, Tag } from "@/types/feed";
import AppShell from "@/components/mobile/AppShell";
import StorefrontIcon from "@/components/mobile/explore/StorefrontIcon";

const HotelsMap = dynamic(() => import("./HotelsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
    </div>
  ),
});

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="relative flex rounded-full bg-white/20 p-1 text-xs font-bold">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-full px-3 py-1 transition-colors ${
            value === o.value ? "bg-white text-[#6F2DBD]" : "text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function HotelsListScreen() {
  const { hotels, loading, error, refresh } = useHotels();
  const [view, setView] = useState<"list" | "map">("map");
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTag, setActiveTag] = useState<number | null>(null);
  const activeTagRef = useRef<number | null>(null);
  const [tagHotels, setTagHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    fetchTags().then(setTags).catch(() => {});
  }, []);

  async function pickTag(id: number) {
    if (activeTag === id) {
      setActiveTag(null);
      activeTagRef.current = null;
      return;
    }
    setActiveTag(id);
    activeTagRef.current = id;
    setTagHotels([]);
    try {
      const result = await fetchTagHotels(id);
      if (activeTagRef.current === id) setTagHotels(result);
    } catch {
      setActiveTag(null);
      activeTagRef.current = null;
    }
  }

  const mapHotels = activeTag === null ? hotels : tagHotels;

  const viewToggle = (
    <Segmented
      value={view}
      onChange={setView}
      options={[
        { value: "list", label: "List" },
        { value: "map", label: "Map" },
      ]}
    />
  );
  const modeToggle = (
    <Segmented
      value={mode}
      onChange={setMode}
      options={[
        { value: "2d", label: "2D" },
        { value: "3d", label: "3D" },
      ]}
    />
  );

  return (
    <AppShell active="hotels">
      {view === "map" ? (
        <>
          <div className="absolute inset-x-0 bottom-16 top-0 lg:bottom-0">
            <HotelsMap hotels={mapHotels} is3D={mode === "3d"} />
          </div>
          <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-[#6F2DBD] p-1.5 pr-2 text-white shadow-lg">
            <span className="pl-2 text-sm font-extrabold">Hotels 🍴</span>
            {viewToggle}
            {modeToggle}
          </div>
          {tags.length > 0 && (
            <div className="absolute inset-x-3 top-16 z-10 flex gap-2 overflow-x-auto pb-1">
              {tags.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => pickTag(t.id)}
                  aria-pressed={activeTag === t.id}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold shadow ${
                    activeTag === t.id
                      ? "border-[#6F2DBD] bg-[#6F2DBD] text-white"
                      : "border-[#E5E0F5] bg-white text-[#333]"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <header className="relative overflow-hidden rounded-b-[28px] bg-linear-to-br from-[#6F2DBD] to-[#A85CF0] px-5 pb-6 pt-5 text-white">
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-white/10" />
          <p className="relative text-xs font-semibold uppercase tracking-wider text-white/70">
            Where to eat
          </p>
          <h1 className="relative mt-1 text-[26px] font-extrabold leading-tight">
            Hotels 🍴
          </h1>
          <div className="relative mt-3 flex items-center gap-2">{viewToggle}</div>
        </header>
      )}

      {view === "list" && loading && hotels.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
        </div>
      )}

      {view === "list" && error && hotels.length === 0 && (
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

      {view === "list" && !loading && !error && hotels.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <span className="text-4xl">🍽️</span>
          <p className="text-[#1A1A1A] font-bold text-lg">No hotels yet</p>
        </div>
      )}

      {view === "list" && hotels.length > 0 && (
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
