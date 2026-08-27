"use client";

import { useState } from "react";
import { PostValidationError } from "@/lib/api";
import type { HotelReview } from "@/types/hotel";
import ReviewRow from "./ReviewRow";
import Stars from "./Stars";

type Props = {
  reviews: HotelReview[];
  userReview: HotelReview | null;
  userRating: number;
  onClose: () => void;
  onSubmitRating: (count: number) => Promise<void>;
  onSubmitReview: (text: string) => Promise<void>;
};

export default function HotelReviewsSheet({
  reviews,
  userReview,
  userRating,
  onClose,
  onSubmitRating,
  onSubmitReview,
}: Props) {
  const [text, setText] = useState(userReview?.review_text ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);

  async function handleRate(count: number) {
    setRatingError(null);
    try {
      await onSubmitRating(count);
    } catch (err) {
      setRatingError(
        err instanceof PostValidationError ? err.message : "Could not save rating"
      );
    }
  }

  async function handleSaveReview() {
    const trimmed = text.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    setReviewError(null);
    setSaved(false);
    try {
      await onSubmitReview(trimmed);
      setSaved(true);
    } catch (err) {
      setReviewError(
        err instanceof PostValidationError ? err.message : "Could not save review"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      <div
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl bg-white"
        style={{ maxHeight: "80vh" }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-[#E5E0F5]" />
        </div>

        <div className="flex items-center justify-between border-b border-[#E5E0F5] px-4 pb-3">
          <h3 className="text-base font-bold text-[#1A1A1A]">Ratings &amp; Reviews</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-xl leading-none text-[#888]"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Your rating */}
          <p className="text-sm font-semibold text-[#1A1A1A]">Your rating</p>
          <div className="mt-2">
            <Stars
              value={userRating}
              size={30}
              interactive
              onChange={handleRate}
            />
          </div>
          {ratingError && (
            <p className="mt-1 text-xs text-red-500">{ratingError}</p>
          )}

          {/* Your review */}
          <p className="mt-5 text-sm font-semibold text-[#1A1A1A]">Your review</p>
          <div className="mt-2 rounded-2xl border border-[#E5E0F5] bg-white px-4 py-3">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setSaved(false);
              }}
              rows={3}
              placeholder="Share your experience…"
              className="w-full resize-none bg-transparent text-[15px] text-[#333] outline-none placeholder-[#BBB]"
            />
          </div>
          {reviewError && (
            <p className="mt-1 text-xs text-red-500">{reviewError}</p>
          )}
          <button
            type="button"
            onClick={handleSaveReview}
            disabled={!text.trim() || saving}
            className="mt-3 w-full rounded-2xl bg-[#6F2DBD] py-3 text-sm font-bold text-white transition-transform active:scale-95 disabled:opacity-60"
          >
            {saving ? "Saving…" : saved ? "Saved" : "Save"}
          </button>

          {/* All reviews */}
          <div className="mt-6 border-t border-[#EEE] pt-2">
            {reviews.length === 0 ? (
              <p className="py-4 text-sm text-[#888]">No reviews yet.</p>
            ) : (
              <div className="divide-y divide-[#EEE]">
                {reviews.map((r) => (
                  <ReviewRow
                    key={r.id}
                    review={r}
                    isOwn={r.id === (userReview?.id ?? null)}
                    ownRatingCount={userRating}
                    clamp={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
