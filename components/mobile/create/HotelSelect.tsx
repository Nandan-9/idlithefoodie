"use client";

import { useEffect, useState } from "react";
import { fetchHotels } from "@/lib/api";
import type { Hotel } from "@/types/feed";

type Props = {
  value: Hotel | null;
  onChange: (hotel: Hotel) => void;
  error?: string;
};

export default function HotelSelect({ value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <label className="text-[#888] text-xs font-medium ml-1">Hotel</label>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 flex w-full items-center justify-between gap-3 rounded-2xl border border-[#E5E0F5] bg-white px-4 py-4 text-left shadow-sm"
      >
        <span className={value ? "text-[#333] text-[15px]" : "text-[#BBB] text-[15px]"}>
          {value ? `${value.name} — ${value.city}` : "Select a hotel"}
        </span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}

      {open && (
        <HotelSheet
          onClose={() => setOpen(false)}
          onPick={(h) => {
            onChange(h);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function HotelSheet({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (hotel: Hotel) => void;
}) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchHotels()
      .then((list) => {
        if (!cancelled) setHotels(list);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load hotels. Tap to retry.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = () => {
    setLoading(true);
    setLoadError(null);
    setAttempt((n) => n + 1);
  };

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
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col rounded-t-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 pt-4">
          <h2 className="text-[#1A1A1A] font-bold text-base">Select a hotel</h2>
          <button onClick={onClose} className="text-[#6F2DBD] font-bold text-sm">
            Done
          </button>
        </div>

        <div className="px-5 py-3">
          <input
            type="text"
            placeholder="Search by name or address"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-[#E5E0F5] bg-[#F8F5FF] px-4 py-3 text-[15px] text-[#333] placeholder-[#BBB] outline-none"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-8">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
            </div>
          ) : loadError ? (
            <button
              onClick={reload}
              className="mx-auto mt-8 block text-sm text-[#E84855]"
            >
              {loadError}
            </button>
          ) : filtered.length === 0 ? (
            <p className="mt-8 text-center text-sm text-[#888]">No hotels found.</p>
          ) : (
            filtered.map((h) => (
              <button
                key={h.id}
                onClick={() => onPick(h)}
                className="flex w-full flex-col items-start gap-0.5 rounded-2xl px-3 py-3 text-left active:bg-[#F8F5FF]"
              >
                <span className="text-[15px] font-semibold text-[#1A1A1A]">{h.name}</span>
                <span className="text-xs text-[#888]">
                  {[h.address, h.city].filter(Boolean).join(", ")}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
