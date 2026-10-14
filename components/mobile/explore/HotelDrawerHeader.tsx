"use client";

import Image from "next/image";
import type { HotelProfile, HotelRatingsSummary } from "@/types/hotel";
import StorefrontIcon from "./StorefrontIcon";

type Props = {
  profile: HotelProfile | null;
  ratings: HotelRatingsSummary;
  reviewCount: number;
  onSeeReviews: () => void;
  onShare: () => void;
  onClose: () => void;
};

function qualitative(avg: number | null): string {
  if (avg == null) return "No ratings yet";
  if (avg >= 4.5) return "Excellent";
  if (avg >= 4) return "Very good";
  if (avg >= 3) return "Good";
  if (avg >= 2) return "Fair";
  return "Poor";
}

const iconButton =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/**
 * Compact identity block for the map drawer: who the hotel is and how it
 * rates, readable at half height. Renders a placeholder while `profile` loads.
 */
export default function HotelDrawerHeader({
  profile,
  ratings,
  reviewCount,
  onSeeReviews,
  onShare,
  onClose,
}: Props) {
  const avg = ratings.average_rating;

  return (
    <div className="shrink-0 bg-gradient-to-br from-[#2A1240] to-[#6F2DBD] px-4 pb-4 pt-6 text-white">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white/20 ring-2 ring-white/80">
          {profile?.avatar ? (
            <Image
              src={profile.avatar}
              alt=""
              width={56}
              height={56}
              sizes="56px"
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <StorefrontIcon size={26} color="#FFFFFF" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          {profile ? (
            <>
              <div className="flex items-center gap-1.5">
                <h1 className="truncate font-display text-[22px] font-bold leading-tight">
                  {profile.name}
                </h1>
                {profile.is_verified && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#F5C518" aria-label="Verified" className="shrink-0">
                    <path d="M12 1l2.5 2.5L18 3l.5 3.5L22 8l-1.8 3L22 14l-3.5 1.5L18 19l-3.5-.5L12 21l-2.5-2.5L6 19l-.5-3.5L2 14l1.8-3L2 8l3.5-1.5L6 3l3.5.5z" />
                    <path d="M9 12l2 2 4-4" stroke="#2A1240" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              {profile.city && (
                <p className="truncate text-sm text-white/70">{profile.city}</p>
              )}
            </>
          ) : (
            <div className="space-y-2 pt-1" aria-hidden="true">
              <span className="block h-5 w-40 animate-pulse rounded bg-white/25" />
              <span className="block h-3.5 w-24 animate-pulse rounded bg-white/15" />
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          {profile && (
            <button type="button" onClick={onShare} aria-label="Share" className={iconButton}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
              </svg>
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Close" className={iconButton}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      {profile && (
        <button
          type="button"
          onClick={onSeeReviews}
          className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-2.5 text-left text-[#1A1A1A] transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span className="flex items-center gap-1">
            <span className="font-display text-[26px] font-bold leading-none">
              {avg != null ? avg.toFixed(1) : "–"}
            </span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#F5C518" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
            </svg>
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-sm font-bold text-[#6F2DBD]">{qualitative(avg)}</span>
            <span className="block text-xs text-[#777]">
              {reviewCount === 0
                ? "Been here? Tell us about the place"
                : `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`}
            </span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B9A9D9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
