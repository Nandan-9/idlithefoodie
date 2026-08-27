"use client";

import type { HotelReview } from "@/types/hotel";
import Stars from "./Stars";
import { formatTimeAgo } from "./timeAgo";

type Props = {
  review: HotelReview;
  isOwn?: boolean;
  ownRatingCount?: number;
  clamp?: boolean;
};

export default function ReviewRow({
  review,
  isOwn = false,
  ownRatingCount,
  clamp = true,
}: Props) {
  return (
    <div className="flex gap-3 py-3">
      {review.user.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={review.user.avatar}
          alt={review.user.username}
          className="h-9 w-9 flex-shrink-0 rounded-full bg-[#E5E0F5] object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#E5E0F5] text-sm font-bold text-[#6F2DBD]">
          {review.user.username[0]?.toUpperCase() ?? "?"}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-bold text-[#1A1A1A]">
            {review.user.username}
            {isOwn && <span className="font-normal text-[#888]"> · You</span>}
          </span>
          <span className="flex-shrink-0 text-xs text-[#888]">
            {formatTimeAgo(review.created_at)}
          </span>
        </div>

        {isOwn && ownRatingCount != null && ownRatingCount > 0 && (
          <div className="mt-0.5">
            <Stars value={ownRatingCount} size={14} />
          </div>
        )}

        <p
          className={`mt-1 text-sm leading-relaxed text-[#555] ${
            clamp ? "line-clamp-2" : ""
          }`}
        >
          {review.review_text}
        </p>
      </div>
    </div>
  );
}
