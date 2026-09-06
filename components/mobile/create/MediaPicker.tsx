"use client";

import { useRef } from "react";

type Item = { previewUrl: string; type: "image" | "video" };

type Props = {
  items: Item[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
};

export default function MediaPicker({ items, onAdd, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onAdd(files);
    // allow re-selecting the same file later
    e.target.value = "";
  }

  return (
    <div>
      <label className="text-[#888] text-xs font-medium ml-1">Photos &amp; videos</label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleChange}
        className="hidden"
      />

      {items.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-1 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#E5E0F5] bg-white py-12 text-[#888] shadow-sm active:scale-[0.99] transition-transform"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6F2DBD"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="text-sm font-medium">Add photos or videos</span>
        </button>
      ) : (
        <div className="mt-1 flex gap-2 overflow-x-auto pb-1">
          {items.map((item, i) => (
            <div
              key={i}
              className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-[#E5E0F5] bg-black"
            >
              {item.type === "video" ? (
                <video
                  src={item.previewUrl}
                  muted
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.previewUrl}
                  alt="Selected media preview"
                  className="h-full w-full object-cover"
                />
              )}
              {item.type === "video" && (
                <span className="absolute bottom-1 left-1 text-white drop-shadow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label="Remove media"
                className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 text-xs font-bold text-[#E84855] shadow"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Add more"
            className="flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#E5E0F5] bg-white text-[#6F2DBD] active:scale-[0.99] transition-transform"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="text-xs font-medium">Add more</span>
          </button>
        </div>
      )}
    </div>
  );
}
