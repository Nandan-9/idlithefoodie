"use client";

import { useState } from "react";
import type { ArchiveSummary } from "@/types/archive";

type Props = {
  archives: ArchiveSummary[];
  /** Omit on a read-only (other user's) profile — hides the "New" circle. */
  onNew?: () => void;
  onOpen: (a: ArchiveSummary) => void;
  title?: string;
};

export default function ArchivesRow({
  archives,
  onNew,
  onOpen,
  title = "My Archives",
}: Props) {
  if (!onNew && archives.length === 0) return null;

  return (
    <div>
      <h3 className="text-[15px] font-bold text-[#1A1A1A]">{title}</h3>
      <div className="mt-3 flex gap-3.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {onNew && <NewCircle onTap={onNew} />}
        {archives.map((a) => (
          <ArchiveChip key={a.id} archive={a} onTap={() => onOpen(a)} />
        ))}
      </div>
    </div>
  );
}

function NewCircle({ onTap }: { onTap: () => void }) {
  return (
    <button
      onClick={onTap}
      className="flex w-[68px] flex-shrink-0 flex-col items-center gap-1"
    >
      <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full border-[2.5px] border-[#6F2DBD] bg-[#FAF7F2]">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6F2DBD] text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </span>
      <span className="text-[10px] text-[#555]">New</span>
    </button>
  );
}

function ArchiveChip({
  archive,
  onTap,
}: {
  archive: ArchiveSummary;
  onTap: () => void;
}) {
  const [imgOk, setImgOk] = useState(true);
  const showCover = archive.cover_url && imgOk;

  return (
    <button
      onClick={onTap}
      className="flex w-[68px] flex-shrink-0 flex-col items-center gap-1"
    >
      <span className="flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#8B52D4] to-[#6F2DBD]">
        {showCover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={archive.cover_url}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setImgOk(false)}
          />
        ) : (
          <span className="text-2xl leading-none">
            {archive.emoji || "🍽️"}
          </span>
        )}
      </span>
      <span className="line-clamp-2 text-center text-[10px] leading-tight text-[#555]">
        {archive.name || "Archive"}
      </span>
    </button>
  );
}
