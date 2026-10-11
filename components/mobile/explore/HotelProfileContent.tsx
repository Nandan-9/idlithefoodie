"use client";

import { useState } from "react";
import { useHotelProfile } from "@/hooks/useHotelProfile";
import HotelCover from "./HotelCover";
import HotelProfileCard from "./HotelProfileCard";
import HotelReviewsPreview from "./HotelReviewsPreview";
import HotelReviewsSheet from "./HotelReviewsSheet";
import HotelPostsGrid from "./HotelPostsGrid";
import ShareHotelModal from "../hotels/ShareHotelModal";

type Props = {
  hotelId: number;
  onClose: () => void;
};

/**
 * The hotel profile page content, sized to fill (and scroll inside) whatever
 * drawer it is rendered in.
 */
export default function HotelProfileContent({ hotelId, onClose }: Props) {
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
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <div
        role="region"
        aria-label={profile?.name ?? "Hotel details"}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden"
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
          <div className="shrink-0">
            <HotelCover onClose={onClose} onShare={() => setShareOpen(true)} />
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
          </div>
        )}
      </div>

      {profile && shareOpen && (
        <ShareHotelModal hotelName={profile.name} onClose={() => setShareOpen(false)} />
      )}

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
