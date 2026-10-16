"use client";

import { useState } from "react";
import { useHotelProfile } from "@/hooks/useHotelProfile";
import { hotelMapsUrl } from "@/lib/geo";
import HotelDrawerHeader from "./HotelDrawerHeader";
import ReviewRow from "./ReviewRow";
import HotelReviewsSheet from "./HotelReviewsSheet";
import HotelPostsGrid from "./HotelPostsGrid";
import OpenPostOverlay from "../feed/OpenPostOverlay";
import ShareHotelModal from "../hotels/ShareHotelModal";

const sectionBand = "h-2 bg-[#F6F4FA]";
const sectionHeading = "font-display text-lg font-bold leading-tight text-[#1A1A1A]";

function DetailIcon({ name }: { name: "vibe" | "people" }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "vibe" ? (
        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
      ) : (
        <>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 4.8a3.2 3.2 0 0 1 0 6.4M21 20c0-2.8-1.8-4.8-4.3-5.4" />
        </>
      )}
    </svg>
  );
}

type Props = {
  hotelId: number;
  onClose: () => void;
};

/**
 * The hotel profile laid out for the map drawer, ordered by what a visitor
 * asks first: what the place is, costs, where it is and whether it's open
 * (pinned header), then dishes and details, what people say, what they've
 * posted, and how to get there (pinned footer).
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
    setPosts,
  } = useHotelProfile(hotelId);
  const [openPostId, setOpenPostId] = useState<number | null>(null);
  const openPost = openPostId != null ? posts.find((p) => p.id === openPostId) : undefined;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const mapsUrl = profile
    ? hotelMapsUrl(profile.location_link ?? profile.location, profile.name)
    : null;
  const reviewCount = reviews.reviews.length;
  const ownReviewId = reviews.user_review?.id ?? null;

  const goodToKnow = profile
    ? [
        { label: "Vibe", value: profile.atmosphere, icon: "vibe" as const },
        { label: "Best for", value: profile.best_for, icon: "people" as const },
      ].filter((f) => f.value)
    : [];
  const dishes = profile?.dishes ?? [];
  const amenities = profile ? [...(profile.services ?? []), ...(profile.facilities ?? [])] : [];
  const hasDetails = dishes.length > 0 || goodToKnow.length > 0 || amenities.length > 0;

  return (
    <>
      <HotelDrawerHeader
        profile={profile}
        ratings={ratings}
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
            {hasDetails && (
              <>
                <div className={sectionBand} />
                <div className="space-y-6 px-4 py-5">
                  {dishes.length > 0 && (
                    <section aria-labelledby="drawer-must-try">
                      <h2 id="drawer-must-try" className={sectionHeading}>
                        Must try
                      </h2>
                      <ul className="mt-2.5 flex flex-wrap gap-2">
                        {dishes.map((dish) => (
                          <li
                            key={dish}
                            className="rounded-full border border-[#E5DCF5] bg-[#FAF8FE] px-3.5 py-1.5 text-[13px] font-semibold text-[#4A2A80]"
                          >
                            {dish}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {goodToKnow.length > 0 && (
                    <section aria-labelledby="drawer-good-to-know">
                      <h2 id="drawer-good-to-know" className={sectionHeading}>
                        Good to know
                      </h2>
                      <dl className="mt-2.5 space-y-3">
                        {goodToKnow.map((f) => (
                          <div key={f.label} className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F2FB] text-[#6F2DBD]">
                              <DetailIcon name={f.icon} />
                            </span>
                            <div className="min-w-0 pt-px">
                              <dt className="text-xs text-[#7A7488]">{f.label}</dt>
                              <dd className="break-words text-sm font-semibold leading-snug text-[#1A1A1A]">
                                {f.value}
                              </dd>
                            </div>
                          </div>
                        ))}
                      </dl>
                    </section>
                  )}

                  {amenities.length > 0 && (
                    <section aria-labelledby="drawer-amenities">
                      <h2 id="drawer-amenities" className={sectionHeading}>
                        Amenities
                      </h2>
                      <ul className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2.5">
                        {amenities.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm leading-snug text-[#333]">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F9D55" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              </>
            )}

            <div className={sectionBand} />

            <section aria-labelledby="drawer-reviews" className="px-4 pt-4">
              <div className="flex items-center justify-between">
                <h2 id="drawer-reviews" className={sectionHeading}>
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

            <div className={`${sectionBand} mt-3`} />

            <HotelPostsGrid posts={posts} onOpen={(p) => setOpenPostId(p.id)} />
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

      {openPost && (
        <OpenPostOverlay
          key={openPost.id}
          post={openPost}
          onClose={() => setOpenPostId(null)}
          setPosts={setPosts}
          refresh={refresh}
        />
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
