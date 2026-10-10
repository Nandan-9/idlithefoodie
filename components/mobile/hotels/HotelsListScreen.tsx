"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useHotels } from "@/hooks/useHotels";
import { fetchHotels, fetchTags, fetchTagHotels } from "@/lib/api";
import type { Hotel, Tag } from "@/types/feed";
import { useRouter, useSearchParams } from "next/navigation";
import { slugify } from "@/lib/slug";
import AppShell from "@/components/mobile/AppShell";
import HotelProfileDrawer from "@/components/mobile/explore/HotelProfileDrawer";
import StorefrontIcon from "@/components/mobile/explore/StorefrontIcon";

const HotelsMap = dynamic(() => import("./HotelsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
    </div>
  ),
});

export default function HotelsListScreen() {
  const { hotels, loading, error, refresh } = useHotels();
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [listOpen, setListOpen] = useState(true);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTag, setActiveTag] = useState<number | null>(null);
  const activeTagRef = useRef<number | null>(null);
  const [tagHotels, setTagHotels] = useState<Hotel[]>([]);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<Hotel[] | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const place = searchParams.get("place");
  // Set when this session pushed ?place=, so closing can pop it off history.
  const pushedPlace = useRef(false);

  useEffect(() => {
    fetchTags().then(setTags).catch(() => {});
  }, []);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchText.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }
    setActiveTag(null);
    activeTagRef.current = null;
    try {
      setSearchResults(await fetchHotels(q));
    } catch {
      setSearchResults([]);
    }
  }

  function clearSearch() {
    setSearchText("");
    setSearchResults(null);
  }

  async function pickTag(id: number) {
    setSearchText("");
    setSearchResults(null);
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

  const selectedHotel = place
    ? hotels.find((h) => slugify(h.name) === place) ?? null
    : null;

  function openHotel(hotel: Hotel) {
    pushedPlace.current = true;
    router.push(`/hotels?place=${slugify(hotel.name)}`, { scroll: false });
  }

  function closeHotel() {
    if (pushedPlace.current) {
      pushedPlace.current = false;
      router.back();
    } else {
      router.replace("/hotels", { scroll: false });
    }
  }

  const mapHotels =
    searchResults ?? (activeTag === null ? hotels : tagHotels);

  return (
    <AppShell active="hotels">
      <div className="absolute inset-x-0 bottom-16 top-0 lg:bottom-0">
        <HotelsMap
          hotels={mapHotels}
          is3D={mode === "3d"}
          onSelectHotel={openHotel}
        />
      </div>

      <form
        onSubmit={runSearch}
        className="absolute inset-x-3 top-3 z-10 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg"
      >
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search hotel or place"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        {searchResults !== null && (
          <button
            type="button"
            onClick={clearSearch}
            className="text-sm font-semibold text-[#6F2DBD]"
          >
            Clear
          </button>
        )}
      </form>
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

      <div className="pointer-events-none absolute inset-x-0 bottom-16 z-20 flex flex-col lg:bottom-0">
        <div className="flex items-center justify-between px-3 pb-3">
          <button
            type="button"
            onClick={() => setListOpen((o) => !o)}
            aria-expanded={listOpen}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#6F2DBD] px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <circle cx="3.5" cy="6" r="1" />
              <circle cx="3.5" cy="12" r="1" />
              <circle cx="3.5" cy="18" r="1" />
            </svg>
            List · {mapHotels.length}
          </button>
          <button
            type="button"
            onClick={() => setMode((m) => (m === "2d" ? "3d" : "2d"))}
            aria-pressed={mode === "3d"}
            aria-label={mode === "2d" ? "Switch to 3D map" : "Switch to 2D map"}
            className="pointer-events-auto rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#6F2DBD] shadow-lg transition-transform active:scale-95"
          >
            {mode === "2d" ? "3D" : "2D"}
          </button>
        </div>

        {listOpen && (
          <div className="pointer-events-auto flex h-[45vh] flex-col rounded-t-3xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
            <div className="flex flex-col items-center px-5 pt-2">
              <span className="h-1 w-10 rounded-full bg-[#E5E0F5]" />
              <p className="mt-2 w-full text-sm font-bold text-[#1A1A1A]">
                {mapHotels.length} {mapHotels.length === 1 ? "hotel" : "hotels"}
              </p>
            </div>

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

            {!loading && !error && mapHotels.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
                <span className="text-4xl">🍽️</span>
                <p className="text-[#1A1A1A] font-bold text-lg">No hotels yet</p>
              </div>
            )}

            {mapHotels.length > 0 && (
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
                {mapHotels.map((hotel) => (
                  <button
                    key={hotel.id}
                    type="button"
                    onClick={() => openHotel(hotel)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-[#E5E0F5] bg-white px-4 py-3 text-left shadow-sm active:scale-[0.98] transition-transform"
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
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedHotel && (
        <HotelProfileDrawer
          key={selectedHotel.id}
          hotelId={selectedHotel.id}
          onClose={closeHotel}
        />
      )}
    </AppShell>
  );
}
