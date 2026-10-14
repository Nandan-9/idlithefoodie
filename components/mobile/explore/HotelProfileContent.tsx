"use client";

import { useState } from "react";
import { useHotelProfile } from "@/hooks/useHotelProfile";
import { hotelMapsUrl } from "@/lib/geo";
import HotelDrawerHeader from "./HotelDrawerHeader";
import ReviewRow from "./ReviewRow";
import HotelReviewsSheet from "./HotelReviewsSheet";
import HotelPostsGrid from "./HotelPostsGrid";
import ShareHotelModal from "../hotels/ShareHotelModal";

type Props = {
  hotelId: number;
  onClose: () => void;
};

/**
 * The hotel profile laid out for the map drawer, ordered by what a visitor
 * asks first: which place this is and how it rates (pinned header), what
 * people say, what they've posted, and how to get there (pinned footer).
 * Sized to fill whatever drawer it is rendered in; only the middle scrolls.
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

  const mapsUrl = profile
    ? hotelMapsUrl(profile.location_link ?? profile.location, profile.name)
    : null;
  const reviewCount = reviews.reviews.length;
  const ownReviewId = reviews.user_review?.id ?? null;

  return (
    <>
      <HotelDrawerHeader
        profile={profile}
        ratings={ratings}
        reviewCount={reviewCount}
        onSeeReviews={() => setSheetOpen(true)}
        onShare={() => setShareOpen(true)}
        onClose={onClose}
      />

      <div
        role="region"
        aria-label={profile?.name ?? "Hotel details"}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain"
      >
        {loading && !profile && (
          <div className="flex flex-1 items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
          </div>
        )}

        {error && !profile && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <p className="text-sm text-[#555]">{error}</p>
            <button
              onClick={refresh}
              className="rounded-2xl bg-[#6F2DBD] px-6 py-3 text-sm font-bold text-white transition-transform active:scale-95"
            >
              Retry
            </button>
          </div>
        )}

        {profile && (
          <div className="shrink-0">
            <section aria-labelledby="drawer-reviews" className="px-4 pt-4">
              <div className="flex items-center justify-between">
                <h2 id="drawer-reviews" className="font-display text-lg font-bold text-[#1A1A1A]">
                  What people say
                </h2>
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="rounded-full px-3 py-1.5 text-sm font-semibold text-[#6F2DBD] active:bg-[#F3EEFB]"
                >
                  {ownReviewId ? "Edit your review" : "Write a review"}
                </button>
              </div>

              {reviewCount === 0 ? (
                <p className="pb-2 pt-1 text-sm text-[#777]">
                  No reviews yet.
                </p>
              ) : (
                <>
                  <div className="divide-y divide-[#F0EBF8]">
                    {reviews.reviews.slice(0, 2).map((r) => (
                      <ReviewRow
                        key={r.id}
                        review={r}
                        isOwn={r.id === ownReviewId}
                        ownRatingCount={ratings.user_rating?.rating_count}
                      />
                    ))}
                  </div>
                  {reviewCount > 2 && (
                    <button
                      type="button"
                      onClick={() => setSheetOpen(true)}
                      className="mb-1 w-full rounded-xl bg-[#F5F2FB] py-2.5 text-sm font-semibold text-[#6F2DBD] active:bg-[#EDE6F8]"
                    >
                      See all {reviewCount} reviews
                    </button>
                  )}
                </>
              )}
            </section>

            <div className="mx-4 mt-3 h-px bg-[#F0EBF8]" />

            <HotelPostsGrid posts={posts} />
          </div>
        )}
      </div>

      {profile && (
        <div className="flex shrink-0 gap-2 border-t border-[#F0EBF8] bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => mapsUrl && window.open(mapsUrl, "_blank", "noopener,noreferrer")}
            disabled={!mapsUrl}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#6F2DBD] text-[15px] font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F2DBD]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Google Map
          </button>
          {profile.phone_number && (
            <a
              href={`tel:${profile.phone_number}`}
              aria-label={`Call ${profile.name}`}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#E5E0F5] text-[#6F2DBD] active:bg-[#F3EEFB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F2DBD]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1.05.34 2.07.63 3.06a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.02-1.02a2 2 0 0 1 2.11-.45c.99.29 2.01.5 3.06.63A2 2 0 0 1 22 16.92z" />
              </svg>
            </a>
          )}
        </div>
      )}

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
