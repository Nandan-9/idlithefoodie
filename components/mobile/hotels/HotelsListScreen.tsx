"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useHotels } from "@/hooks/useHotels";
import { fetchHotels, fetchTags, fetchTagHotels } from "@/lib/api";
import type { Hotel, Tag } from "@/types/feed";
import { useRouter, useSearchParams } from "next/navigation";
import { slugify } from "@/lib/slug";
import AppShell from "@/components/mobile/AppShell";
import HotelProfileContent from "@/components/mobile/explore/HotelProfileContent";
import StorefrontIcon from "@/components/mobile/explore/StorefrontIcon";

const HotelsMap = dynamic(() => import("./HotelsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
    </div>
  ),
});

type Snap = "peek" | "half" | "full";
// Sheet heights: peek shows the handle, count and the nearest hotel.
const SNAP_CSS: Record<Snap, string> = {
  peek: "176px",
  half: "45dvh",
  full: "82dvh",
};
const SNAP_ORDER: Snap[] = ["peek", "half", "full"];
// Share of the map hidden behind the sheet, used to centre pins above it.
const SNAP_FRAC: Record<Snap, number> = { peek: 0.2, half: 0.45, full: 0.45 };
const SEARCH_DELAY = 300;

const HotelRow = memo(function HotelRow({
  hotel,
  onOpen,
}: {
  hotel: Hotel;
  onOpen: (hotel: Hotel) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(hotel)}
      className="flex w-full items-center gap-3 rounded-2xl border border-[#E5E0F5] bg-white px-4 py-3 text-left shadow-sm transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F2DBD] [contain-intrinsic-size:auto_74px] [content-visibility:auto]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F0EAFB]">
        <StorefrontIcon size={24} color="#6F2DBD" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-[#1A1A1A]">{hotel.name}</p>
        <p className="truncate text-sm text-[#777]">
          {[hotel.address, hotel.city].filter(Boolean).join(", ")}
        </p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B9A9D9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
});

function RowSkeletons() {
  return (
    <div className="flex flex-col gap-2 p-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-3 rounded-2xl border border-[#EFEAFA] px-4 py-3"
        >
          <span className="h-12 w-12 rounded-full bg-[#F0EAFB]" />
          <div className="flex-1 space-y-2">
            <span className="block h-3.5 w-2/3 rounded bg-[#F0EAFB]" />
            <span className="block h-3 w-1/2 rounded bg-[#F6F2FC]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HotelsListScreen() {
  const { hotels, loading, error, refresh } = useHotels();
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [snap, setSnap] = useState<Snap>("peek");
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTag, setActiveTag] = useState<number | null>(null);
  const [tagLoading, setTagLoading] = useState(false);
  const [tagHotels, setTagHotels] = useState<Hotel[]>([]);
  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const [searchResults, setSearchResults] = useState<Hotel[] | null>(null);
  const [viewIds, setViewIds] = useState<number[] | null>(null);
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const place = searchParams.get("place");
  // Set when this session pushed ?place=, so closing can pop it off history.
  const pushedPlace = useRef(false);
  // Latest-request-wins guard shared by search and tag fetches.
  const requestId = useRef(0);
  const searchTimer = useRef<number | undefined>(undefined);
  const dragStart = useRef<{ y: number; h: number; moved: boolean } | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTags().then(setTags).catch(() => {});
    return () => window.clearTimeout(searchTimer.current);
  }, []);

  // ---- search & filters ----------------------------------------------------

  async function runSearch(q: string) {
    const id = ++requestId.current;
    setActiveTag(null);
    setTagLoading(false);
    setSearchFailed(false);
    setSearching(true);
    try {
      const result = await fetchHotels(q);
      if (id === requestId.current) setSearchResults(result);
    } catch {
      if (id === requestId.current) {
        setSearchResults([]);
        setSearchFailed(true);
      }
    } finally {
      if (id === requestId.current) setSearching(false);
    }
  }

  function onSearchChange(value: string) {
    setSearchText(value);
    window.clearTimeout(searchTimer.current);
    const q = value.trim();
    if (!q) {
      requestId.current++;
      setSearchResults(null);
      setSearching(false);
      setSearchFailed(false);
      return;
    }
    setSearching(true);
    searchTimer.current = window.setTimeout(() => runSearch(q), SEARCH_DELAY);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    window.clearTimeout(searchTimer.current);
    const q = searchText.trim();
    if (q) runSearch(q);
  }

  function clearSearch() {
    onSearchChange("");
  }

  async function pickTag(id: number) {
    window.clearTimeout(searchTimer.current);
    setSearchText("");
    setSearchResults(null);
    setSearching(false);
    setSearchFailed(false);
    const reqId = ++requestId.current;
    if (activeTag === id) {
      setActiveTag(null);
      setTagLoading(false);
      return;
    }
    setActiveTag(id);
    setTagLoading(true);
    setTagHotels([]);
    try {
      const result = await fetchTagHotels(id);
      if (reqId === requestId.current) setTagHotels(result);
    } catch {
      if (reqId === requestId.current) setActiveTag(null);
    } finally {
      if (reqId === requestId.current) setTagLoading(false);
    }
  }

  function resetFilters() {
    requestId.current++;
    window.clearTimeout(searchTimer.current);
    setSearchText("");
    setSearchResults(null);
    setSearching(false);
    setSearchFailed(false);
    setActiveTag(null);
    setTagLoading(false);
  }

  // ---- selection -----------------------------------------------------------

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

  // ---- list data -----------------------------------------------------------

  const filtered = searchResults ?? (activeTag === null ? hotels : tagHotels);
  const filtersOn = searchResults !== null || activeTag !== null;

  const inView = useMemo(() => {
    if (showAll || viewIds === null) return null;
    const byId = new Map(filtered.map((h) => [h.id, h]));
    return viewIds.flatMap((id) => byId.get(id) ?? []);
  }, [filtered, viewIds, showAll]);

  const listHotels = inView ?? filtered;
  const busy = tagLoading || (searching && searchResults === null);

  // The map reports ids in view; skip the update when nothing changed.
  const lastView = useRef("");
  function onViewChange(ids: number[]) {
    const key = ids.join(",");
    if (key === lastView.current) return;
    lastView.current = key;
    setViewIds(ids);
  }

  const toggle3D = () => setMode((m) => (m === "2d" ? "3d" : "2d"));

  // ---- bottom sheet drag ---------------------------------------------------

  function onHandleDown(e: React.PointerEvent) {
    const el = sheetRef.current;
    if (!el) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { y: e.clientY, h: el.offsetHeight, moved: false };
  }

  function onHandleMove(e: React.PointerEvent) {
    const d = dragStart.current;
    if (!d) return;
    const dy = d.y - e.clientY;
    if (Math.abs(dy) > 4) d.moved = true;
    if (!d.moved) return;
    const max = window.innerHeight * 0.82;
    setDragHeight(Math.min(max, Math.max(120, d.h + dy)));
  }

  function onHandleUp() {
    const d = dragStart.current;
    dragStart.current = null;
    if (!d) return;
    if (!d.moved) {
      // A tap steps through the snaps.
      setSnap((s) => SNAP_ORDER[(SNAP_ORDER.indexOf(s) + 1) % SNAP_ORDER.length]);
      return;
    }
    const h = sheetRef.current?.offsetHeight ?? d.h;
    const vh = window.innerHeight;
    const targets: Record<Snap, number> = { peek: 176, half: vh * 0.45, full: vh * 0.82 };
    const nearest = SNAP_ORDER.reduce((best, s) =>
      Math.abs(targets[s] - h) < Math.abs(targets[best] - h) ? s : best
    );
    setSnap(nearest);
    setDragHeight(null);
  }

  const sheetStyle = { height: dragHeight ?? SNAP_CSS[snap] };
  const bottomFrac = selectedHotel ? 0.45 : SNAP_FRAC[snap];

  // ---- render --------------------------------------------------------------

  const countLabel = inView
    ? `${inView.length} in view`
    : `${listHotels.length} ${listHotels.length === 1 ? "hotel" : "hotels"}`;

  return (
    <AppShell active="hotels">
      <div className="absolute inset-x-0 bottom-16 top-0 lg:bottom-0">
        <HotelsMap
          hotels={filtered}
          selected={selectedHotel}
          is3D={mode === "3d"}
          bottomFrac={bottomFrac}
          onToggle3D={toggle3D}
          onSelectHotel={openHotel}
          onViewChange={onViewChange}
        />
      </div>

      <form
        onSubmit={submitSearch}
        role="search"
        className="absolute inset-x-3 top-3 z-10 flex items-center gap-2 rounded-full bg-white py-1 pl-4 pr-1.5 shadow-[0_2px_12px_rgba(42,18,64,0.2)] focus-within:ring-2 focus-within:ring-[#6F2DBD]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6F2DBD" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          type="search"
          enterKeyHint="search"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search hotels or places"
          aria-label="Search hotels or places"
          className="h-10 min-w-0 flex-1 bg-transparent text-base text-[#1A1A1A] outline-none placeholder:text-[#8F7BB5] [&::-webkit-search-cancel-button]:hidden"
        />
        {searching ? (
          <span
            className="mr-2.5 h-4 w-4 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent"
            role="status"
            aria-label="Searching"
          />
        ) : (
          searchText && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#6F2DBD] active:bg-[#F3EEFB]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )
        )}
      </form>

      {tags.length > 0 && (
        <div
          role="group"
          aria-label="Filter by tag"
          className="absolute inset-x-0 top-[68px] z-10 flex gap-2 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tags.map((t) => {
            const active = activeTag === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => pickTag(t.id)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold shadow-[0_1px_6px_rgba(42,18,64,0.18)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F2DBD] ${
                  active ? "bg-[#6F2DBD] text-white" : "bg-white text-[#3B2A57]"
                }`}
              >
                {t.name}
                {active && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-16 z-20 flex flex-col lg:bottom-0">
        {selectedHotel && (
          <div className="pointer-events-auto flex h-[45dvh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
            <HotelProfileContent
              key={selectedHotel.id}
              hotelId={selectedHotel.id}
              onClose={closeHotel}
            />
          </div>
        )}

        {!selectedHotel && (
          <div
            ref={sheetRef}
            style={sheetStyle}
            className={`pointer-events-auto flex flex-col rounded-t-3xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.12)] ${
              dragHeight === null ? "transition-[height] duration-200 ease-out motion-reduce:transition-none" : ""
            }`}
          >
            <div
              onPointerDown={onHandleDown}
              onPointerMove={onHandleMove}
              onPointerUp={onHandleUp}
              onPointerCancel={onHandleUp}
              className="shrink-0 cursor-grab touch-none select-none px-5 pb-2 pt-2.5"
            >
              <span className="mx-auto block h-1 w-10 rounded-full bg-[#DAD2EE]" />
              <div className="mt-2.5 flex items-center justify-between">
                <p className="text-sm font-bold text-[#1A1A1A]" aria-live="polite">
                  {busy ? "Finding hotels…" : countLabel}
                </p>
                <div className="flex items-center gap-1">
                  {inView && filtered.length > inView.length && (
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => setShowAll(true)}
                      className="rounded-full px-2.5 py-1 text-sm font-semibold text-[#6F2DBD] active:bg-[#F3EEFB]"
                    >
                      Show all {filtered.length}
                    </button>
                  )}
                  {showAll && (
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => setShowAll(false)}
                      className="rounded-full px-2.5 py-1 text-sm font-semibold text-[#6F2DBD] active:bg-[#F3EEFB]"
                    >
                      Only in view
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
              {busy && <RowSkeletons />}

              {!busy && loading && hotels.length === 0 && <RowSkeletons />}

              {!busy && error && hotels.length === 0 && (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-6 text-center">
                  <p className="text-sm text-[#555]">{error}</p>
                  <button
                    onClick={refresh}
                    className="rounded-2xl bg-[#6F2DBD] px-6 py-3 text-sm font-bold text-white transition-transform active:scale-95"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!busy && !loading && !error && listHotels.length === 0 && (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 py-6 text-center">
                  <p className="text-base font-bold text-[#1A1A1A]">
                    {searchFailed
                      ? "Search didn't go through"
                      : filtersOn
                        ? "No hotels match"
                        : inView
                          ? "No hotels in this area"
                          : "No hotels yet"}
                  </p>
                  <p className="text-sm text-[#777]">
                    {searchFailed
                      ? "Check your connection and try again."
                      : filtersOn
                        ? "Try a different search or tag."
                        : inView
                          ? "Drag the map or zoom out to find more."
                          : "Check back soon."}
                  </p>
                  {(filtersOn || inView) && (
                    <button
                      type="button"
                      onClick={() => (filtersOn ? resetFilters() : setShowAll(true))}
                      className="mt-1 rounded-full bg-[#6F2DBD] px-5 py-2.5 text-sm font-bold text-white transition-transform active:scale-95"
                    >
                      {filtersOn ? "Clear filters" : `Show all ${filtered.length}`}
                    </button>
                  )}
                </div>
              )}

              {!busy && listHotels.length > 0 && (
                <div className="flex flex-col gap-2 p-3">
                  {listHotels.map((hotel) => (
                    <HotelRow key={hotel.id} hotel={hotel} onOpen={openHotel} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
