"use client";

import { useState } from "react";
import Link from "next/link";
import { useHotelProfile } from "@/hooks/useHotelProfile";
import AppShell from "@/components/mobile/AppShell";
import HotelCover from "./HotelCover";
import HotelProfileCard from "./HotelProfileCard";
import HotelReviewsPreview from "./HotelReviewsPreview";
import HotelReviewsSheet from "./HotelReviewsSheet";
import HotelPostsGrid from "./HotelPostsGrid";

export default function HotelProfileScreen({ hotelId }: { hotelId: number }) {
  const {
    profile,
    ratings,
    reviews,
    posts,
    loading,
    error,
    refresh,
    submitRating,
    submitReview,
  } = useHotelProfile(hotelId);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <AppShell active="explore" nav={false}>
      {loading && !profile && (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
        </div>
      )}

      {error && !profile && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm text-[#555]">{error}</p>
          <button
            onClick={refresh}
            className="rounded-2xl bg-[#6F2DBD] px-6 py-3 text-sm font-bold text-white transition-transform active:scale-95"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && !profile && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <p className="text-lg font-bold text-[#1A1A1A]">Hotel not found</p>
          <Link href="/explore" className="text-sm font-bold text-[#6F2DBD]">
            Back to Explore
          </Link>
        </div>
      )}

      {profile && (
        <>
          <HotelCover />
          <HotelProfileCard
            profile={profile}
            ratings={ratings}
            reviewCount={reviews.reviews.length}
            onRateReview={() => setSheetOpen(true)}
          />
          <HotelReviewsPreview
            reviews={reviews.reviews}
            ownReviewId={reviews.user_review?.id ?? null}
            ownRatingCount={ratings.user_rating?.rating_count}
            onSeeAll={() => setSheetOpen(true)}
          />
          <HotelPostsGrid posts={posts} />

          {sheetOpen && (
            <HotelReviewsSheet
              reviews={reviews.reviews}
              userReview={reviews.user_review}
              userRating={ratings.user_rating?.rating_count ?? 0}
              onClose={() => setSheetOpen(false)}
              onSubmitRating={submitRating}
              onSubmitReview={submitReview}
            />
          )}
        </>
      )}
    </AppShell>
  );
}
