"use client";

import { useRef } from "react";

type Props = {
  previewUrl: string | null;
  mediaType: "image" | "video";
  onSelect: (file: File) => void;
  onClear: () => void;
};

export default function MediaPicker({
  previewUrl,
  mediaType,
  onSelect,
  onClear,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onSelect(file);
    // allow re-selecting the same file later
    e.target.value = "";
  }

  return (
    <div>
      <label className="text-[#888] text-xs font-medium ml-1">Photo or video</label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="mt-1 relative overflow-hidden rounded-2xl border border-[#E5E0F5] bg-black shadow-sm">
          {mediaType === "video" ? (
            <video
              src={previewUrl}
              controls
              className="w-full max-h-[420px] object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Selected media preview"
              className="w-full max-h-[420px] object-contain"
            />
          )}
          <div className="absolute right-2 top-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#6F2DBD] shadow"
            >
              Change
            </button>
            <button
              type="button"
              onClick={onClear}
              aria-label="Remove media"
              className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-[#E84855] shadow"
            >
              ×
            </button>
          </div>
        </div>
      ) : (
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
          <span className="text-sm font-medium">Add photo or video</span>
        </button>
      )}
    </div>
  );
}
