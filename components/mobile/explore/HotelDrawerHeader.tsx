"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HotelProfile, HotelRatingsSummary } from "@/types/hotel";
import { openStatus } from "@/lib/hours";
import StorefrontIcon from "./StorefrontIcon";

type Props = {
  profile: HotelProfile | null;
  ratings: HotelRatingsSummary;
  onSeeReviews: () => void;
  onShare: () => void;
  onClose: () => void;
};

const iconButton =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F2FB] text-[#4A3B63] transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F2DBD]";

export function formatPriceRange(profile: HotelProfile): string {
  const [min, max] = [profile.price_min, profile.price_max].map((p) => (p != null ? Number(p) : null));
  if (min != null && max != null) return `₹${min} – ₹${max}`;
  if (min != null) return `From ₹${min}`;
  if (max != null) return `Up to ₹${max}`;
  return "";
}

/** Re-renders every minute so the open/closed line stays current. */
function useMinuteClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/**
 * Identity block for the map drawer, answering what a visitor checks first:
 * what the place is, what it serves and costs, where it is, whether it's open
 * right now, and how it rates. Renders a placeholder while `profile` loads.
 */
export default function HotelDrawerHeader({
  profile,
  ratings,
  onSeeReviews,
  onShare,
  onClose,
}: Props) {
  const now = useMinuteClock();
  const [hoursOpen, setHoursOpen] = useState(false);
  const avg = ratings.average_rating;

  const status = openStatus(profile?.hours, now);
  const price = profile ? formatPriceRange(profile) : "";
  const cuisines = profile?.cuisines?.join(", ") ?? "";
  const address =
    profile?.city && !profile.address?.includes(profile.city)
      ? [profile.address, profile.city].filter(Boolean).join(", ")
      : (profile?.address ?? "");

  return (
    <div className="shrink-0 bg-white px-4 pb-4 pt-6">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#F5F2FB] ring-1 ring-[#E5E0F5]">
          {profile?.avatar ? (
            <Image
              src={profile.avatar}
              alt=""
              width={44}
              height={44}
              sizes="44px"
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <StorefrontIcon size={20} color="#6F2DBD" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 self-center">
          {profile ? (
            <div className="flex items-center gap-1.5">
              <h1 className="font-display text-[22px] font-bold leading-[1.15] text-[#1A1A1A] [overflow-wrap:anywhere]">
                {profile.name}
              </h1>
              {profile.is_verified && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#6F2DBD" aria-label="Verified" className="shrink-0">
                  <path d="M12 1l2.5 2.5L18 3l.5 3.5L22 8l-1.8 3L22 14l-3.5 1.5L18 19l-3.5-.5L12 21l-2.5-2.5L6 19l-.5-3.5L2 14l1.8-3L2 8l3.5-1.5L6 3l3.5.5z" />
                  <path d="M9 12l2 2 4-4" stroke="#FFFFFF" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ) : (
            <span className="block h-5 w-40 animate-pulse rounded bg-[#EEE9F7]" aria-hidden="true" />
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          {profile && (
            <button type="button" onClick={onShare} aria-label="Share" className={iconButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
              </svg>
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Close" className={iconButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      {profile ? (
        <div className="mt-3 flex items-start gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            {(cuisines || price) && (
              <p className="flex flex-wrap items-center gap-x-2 text-[15px] leading-snug text-[#4A4A4A]">
                {cuisines && <span>{cuisines}</span>}
                {cuisines && price && <span aria-hidden="true" className="h-3.5 w-px bg-[#D8D2E6]" />}
                {price && <span className="font-semibold text-[#1A1A1A]">{price}</span>}
              </p>
            )}

            {address && (
              <p className="line-clamp-2 text-sm leading-snug text-[#7A7488]">{address}</p>
            )}

            {profile.hours && (
              <div>
                <button
                  type="button"
                  onClick={() => setHoursOpen((v) => !v)}
                  aria-expanded={hoursOpen}
                  className="-mx-1 flex items-center gap-1.5 rounded-md px-1 py-0.5 text-sm focus-visible:outline-2 focus-visible:outline-[#6F2DBD]"
                >
                  {status ? (
                    <>
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${
                          !status.open ? "bg-[#D64545]" : status.closingSoon ? "bg-[#E08A00]" : "bg-[#1F9D55]"
                        }`}
                      />
                      <span
                        className={`font-semibold ${
                          !status.open ? "text-[#C23B3B]" : status.closingSoon ? "text-[#B86E00]" : "text-[#17804A]"
                        }`}
                      >
                        {!status.open ? "Closed" : status.closingSoon ? "Closing soon" : "Open now"}
                      </span>
                      <span className="text-[#4A4A4A]">
                        {status.detail === "Open 24 hours" ? "24 hours" : status.detail}
                      </span>
                    </>
                  ) : (
                    <span className="text-[#4A4A4A]">Hours</span>
                  )}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9A93AA"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className={`transition-transform ${hoursOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {hoursOpen && (
                  <p className="mt-0.5 text-sm text-[#7A7488]">{profile.hours}</p>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onSeeReviews}
            aria-label={
              avg != null
                ? `Rated ${avg.toFixed(1)} from ${ratings.rating_count} ratings. See reviews`
                : "No ratings yet. Rate this place"
            }
            className="flex w-14 shrink-0 flex-col overflow-hidden rounded-xl border border-[#E5E0F5] text-center transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F2DBD]"
          >
            <span
              className={`flex items-center justify-center gap-0.5 py-1.5 text-[15px] font-bold text-white ${
                avg != null ? "bg-[#6F2DBD]" : "bg-[#B9A9D9]"
              }`}
            >
              {avg != null ? avg.toFixed(1) : "New"}
              {avg != null && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                </svg>
              )}
            </span>
            <span className="py-1 text-[11px] font-semibold leading-tight text-[#4A3B63]">
              {avg != null ? ratings.rating_count : "Rate"}
            </span>
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2" aria-hidden="true">
          <span className="block h-4 w-48 animate-pulse rounded bg-[#EEE9F7]" />
          <span className="block h-3.5 w-64 animate-pulse rounded bg-[#F3F0F9]" />
          <span className="block h-3.5 w-32 animate-pulse rounded bg-[#F3F0F9]" />
        </div>
      )}
    </div>
  );
}
