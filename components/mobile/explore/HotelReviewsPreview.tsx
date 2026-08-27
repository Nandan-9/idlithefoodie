"use client";

import type { HotelReview } from "@/types/hotel";
import ReviewRow from "./ReviewRow";

type Props = {
  reviews: HotelReview[];
  ownReviewId: number | null;
  ownRatingCount?: number;
  onSeeAll: () => void;
};

export default function HotelReviewsPreview({
  reviews,
  ownReviewId,
  ownRatingCount,
  onSeeAll,
}: Props) {
  return (
    <div className="mx-4 mt-4 rounded-2xl border border-[#E5E0F5] bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#6F2DBD]">Reviews</h2>
        <button
          type="button"
          onClick={onSeeAll}
          className="flex items-center gap-0.5 text-sm font-semibold text-[#6F2DBD]"
        >
          See All
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {reviews.length === 0 ? (
        <p className="pt-3 text-sm text-[#888]">No reviews yet.</p>
      ) : (
        <div className="mt-1 divide-y divide-[#EEE]">
          {reviews.slice(0, 2).map((r) => (
            <ReviewRow
              key={r.id}
              review={r}
              isOwn={r.id === ownReviewId}
              ownRatingCount={ownRatingCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
