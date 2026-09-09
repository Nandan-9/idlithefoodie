"use client";

import type { ArchivePostMedia } from "@/types/archive";

type Props = {
  media: ArchivePostMedia[];
  selectable?: boolean;
  selected?: boolean;
  onTap: () => void;
};

export default function InstantThumbCell({
  media,
  selectable,
  selected,
  onTap,
}: Props) {
  const first = media[0];
  const src = first?.thumbnail_url || first?.media_url;
  const isVideo = first?.content_type === "video";

  return (
    <button
      onClick={onTap}
      className="relative aspect-square bg-[#E5E0F5]"
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className={`h-full w-full object-cover transition-opacity ${
            selected ? "opacity-60" : ""
          }`}
        />
      )}

      {isVideo && !selectable && (
        <span className="absolute top-1.5 right-1.5 text-white drop-shadow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      )}

      {selectable && (
        <span
          className={`absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
            selected
              ? "border-[#6F2DBD] bg-[#6F2DBD] text-white"
              : "border-white bg-black/20"
          }`}
        >
          {selected && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </span>
      )}
    </button>
  );
}
