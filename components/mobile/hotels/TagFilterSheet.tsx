"use client";

import { useEffect } from "react";
import type { Tag } from "@/types/feed";

type Props = {
  tags: Tag[];
  selected: number[];
  onToggle: (id: number) => void;
  onClear: () => void;
  onClose: () => void;
};

/** Modal listing every tag; any number can be switched on and the map follows. */
export default function TagFilterSheet({ tags, selected, onToggle, onClear, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter by tag"
        className="relative flex max-h-[70dvh] w-full max-w-md flex-col rounded-t-3xl bg-white shadow-xl lg:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-[#E5E0F5] px-5 py-4">
          <h2 className="text-base font-extrabold text-[#1A1A1A]">Filter by tag</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-[#888] active:scale-90"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 overflow-y-auto px-5 py-4">
          {tags.map((t) => {
            const on = selected.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onToggle(t.id)}
                aria-pressed={on}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F2DBD] ${
                  on
                    ? "border-[#6F2DBD] bg-[#6F2DBD] text-white"
                    : "border-[#E5E0F5] bg-white text-[#3B2A57]"
                }`}
              >
                {on && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                )}
                {t.name}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 border-t border-[#E5E0F5] px-5 py-3">
          <button
            type="button"
            onClick={onClear}
            disabled={selected.length === 0}
            className="text-sm font-semibold text-[#6F2DBD] disabled:text-[#B9AECF]"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-full bg-[#6F2DBD] px-6 py-2.5 text-sm font-bold text-white active:scale-95"
          >
            {selected.length > 0 ? `Done · ${selected.length} selected` : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
