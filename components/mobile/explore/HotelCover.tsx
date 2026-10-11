"use client";

import { useRouter } from "next/navigation";
import StorefrontIcon from "./StorefrontIcon";

export default function HotelCover({
  onClose,
  onShare,
}: {
  onClose?: () => void;
  onShare?: () => void;
}) {
  const router = useRouter();

  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-br from-[#2A1240] to-[#6F2DBD] ${
        onClose ? "h-[120px]" : "h-[230px]"
      }`}
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <StorefrontIcon size={120} color="#FFFFFF" />
      </div>

      {onShare && (
        <button
          onClick={onShare}
          aria-label="Share"
          className="absolute right-[68px] top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition-transform active:scale-90"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A1A1A" stroke="#1A1A1A" strokeLinecap="round">
            <circle cx="18" cy="5" r="3" stroke="none" />
            <circle cx="6" cy="12" r="3" stroke="none" />
            <circle cx="18" cy="19" r="3" stroke="none" />
            <path d="M8.6 10.6l6.8-4M8.6 13.4l6.8 4" strokeWidth="2" fill="none" />
          </svg>
        </button>
      )}

      {onClose ? (
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition-transform active:scale-90"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      ) : (
        <>
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition-transform active:scale-90"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            aria-label="Options"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition-transform active:scale-90"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A1A1A">
              <circle cx="5" cy="12" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="19" cy="12" r="1.6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
