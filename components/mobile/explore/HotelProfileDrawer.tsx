"use client";

import { useState } from "react";
import { useHotelProfile } from "@/hooks/useHotelProfile";
import HotelCover from "./HotelCover";
import HotelProfileCard from "./HotelProfileCard";
import HotelReviewsPreview from "./HotelReviewsPreview";
import HotelReviewsSheet from "./HotelReviewsSheet";
import HotelPostsGrid from "./HotelPostsGrid";

type Props = {
  hotelId: number;
  onClose: () => void;
};

/** The hotel profile page content as a bottom drawer over the current screen. */
export default function HotelProfileDrawer({ hotelId, onClose }: Props) {
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
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-label={profile?.name ?? "Hotel details"}
        className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-h-[90vh] min-h-[40vh] w-full max-w-[480px] flex-col overflow-y-auto overflow-x-hidden rounded-t-3xl bg-white shadow-xl"
      >
        {loading && !profile && (
          <div className="flex flex-1 items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
          </div>
        )}

        {error && !profile && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <p className="text-sm text-[#555]">{error}</p>
            <button
              onClick={refresh}
              className="rounded-2xl bg-[#6F2DBD] px-6 py-3 text-sm font-bold text-white transition-transform active:scale-95"
            >
              Retry
            </button>
            <button onClick={onClose} className="text-sm font-bold text-[#6F2DBD]">
              Close
            </button>
          </div>
        )}

        {profile && (
          <>
            <HotelCover onClose={onClose} />
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
          </>
        )}
      </div>

      {profile && sheetOpen && (
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
  );
}
