"use client";

import Image from "next/image";
import { hotelMapsUrl } from "@/lib/geo";
import type { HotelProfile, HotelRatingsSummary } from "@/types/hotel";
import StorefrontIcon from "./StorefrontIcon";

type Props = {
  profile: HotelProfile;
  ratings: HotelRatingsSummary;
  reviewCount: number;
  onRateReview: () => void;
};

function qualitative(avg: number | null): string {
  if (avg == null) return "No ratings yet";
  if (avg >= 4.5) return "Excellent";
  if (avg >= 4) return "Very Good";
  if (avg >= 3) return "Good";
  if (avg >= 2) return "Fair";
  return "Poor";
}

export default function HotelProfileCard({
  profile,
  ratings,
  reviewCount,
  onRateReview,
}: Props) {
  const mapsUrl = hotelMapsUrl(
    profile.location_link ?? profile.location,
    profile.name
  );

  function openMaps() {
    if (mapsUrl) window.open(mapsUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="relative z-10 -mt-6 rounded-t-3xl bg-white px-5 pt-4 pb-5">
      {/* Avatar straddling the cover seam */}
      <div className="absolute -top-[70px] left-5 h-[130px] w-[130px] overflow-hidden rounded-full border-4 border-white bg-[#E5E0F5] shadow-lg">
        {profile.avatar ? (
          <Image
            src={profile.avatar}
            alt={profile.name}
            width={130}
            height={130}
            sizes="130px"
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <StorefrontIcon size={52} />
          </div>
        )}
      </div>

      <div className="flex min-h-[70px] items-start justify-between gap-3 pl-[145px]">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[22px] font-extrabold leading-tight text-[#1A1A1A]">
              {profile.name}
            </h1>
            {profile.is_verified && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#6F2DBD" stroke="none" className="flex-shrink-0">
                <path d="M12 1l2.5 2.5L18 3l.5 3.5L22 8l-1.8 3L22 14l-3.5 1.5L18 19l-3.5-.5L12 21l-2.5-2.5L6 19l-.5-3.5L2 14l1.8-3L2 8l3.5-1.5L6 3l3.5.5z" />
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 flex-col items-end">
          <div className="flex items-center gap-1">
            <span className="text-[26px] font-extrabold leading-none text-[#1A1A1A]">
              {ratings.average_rating != null
                ? ratings.average_rating.toFixed(1)
                : "—"}
            </span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#F5C518" stroke="#F5C518" strokeWidth="2" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#6F2DBD]">
            {qualitative(ratings.average_rating)}
          </span>
          <span className="text-xs text-[#888]">({reviewCount} Reviews)</span>
        </div>
      </div>

      {/* Info rows */}
      <div className="mt-3 space-y-2">
        <button
          type="button"
          onClick={openMaps}
          disabled={!mapsUrl}
          className="flex w-full items-start gap-2 text-left text-sm text-[#555] disabled:cursor-default"
        >
          <PinIcon />
          <span>{profile.address}</span>
        </button>

        {profile.phone_number && (
          <a
            href={`tel:${profile.phone_number}`}
            className="flex items-center gap-2 text-sm text-[#555]"
          >
            <PhoneIcon />
            <span>{profile.phone_number}</span>
          </a>
        )}

        {profile.city && (
          <div className="flex items-center gap-2 text-sm text-[#555]">
            <PinIcon />
            <span>{profile.city}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onRateReview}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E5E0F5] bg-white py-3.5 text-sm font-semibold text-[#1A1A1A] transition-transform active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
          </svg>
          Rate &amp; Review
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#F5C518] py-3.5 text-sm font-bold text-[#1A1A1A] transition-transform active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h13a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2z" />
            <line x1="8" y1="8" x2="14" y2="8" />
            <line x1="8" y1="12" x2="14" y2="12" />
          </svg>
          View Menu
        </button>
      </div>
    </div>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6F2DBD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6F2DBD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1.05.34 2.07.63 3.06a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.02-1.02a2 2 0 0 1 2.11-.45c.99.29 2.01.5 3.06.63A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
