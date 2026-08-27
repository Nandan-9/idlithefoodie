"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchHotelProfile,
  fetchHotelRatings,
  fetchHotelReviews,
  fetchHotelPosts,
  rateHotel,
  reviewHotel,
} from "@/lib/api";
import type { Post } from "@/types/feed";
import type {
  HotelProfile,
  HotelRatingsSummary,
  HotelReviewsData,
} from "@/types/hotel";

const EMPTY_RATINGS: HotelRatingsSummary = {
  average_rating: null,
  rating_count: 0,
  user_rating: null,
};
const EMPTY_REVIEWS: HotelReviewsData = { reviews: [], user_review: null };

type State = {
  profile: HotelProfile | null;
  ratings: HotelRatingsSummary;
  reviews: HotelReviewsData;
  posts: Post[];
  loading: boolean;
  error: string | null;
};

export function useHotelProfile(hotelId: number) {
  const [state, setState] = useState<State>({
    profile: null,
    ratings: EMPTY_RATINGS,
    reviews: EMPTY_REVIEWS,
    posts: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const [profileR, ratingsR, reviewsR, postsR] = await Promise.allSettled([
      fetchHotelProfile(hotelId),
      fetchHotelRatings(hotelId),
      fetchHotelReviews(hotelId),
      fetchHotelPosts(hotelId),
    ]);

    if (profileR.status === "rejected") {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Could not load this hotel. Tap retry.",
      }));
      return;
    }

    setState({
      profile: profileR.value,
      ratings: ratingsR.status === "fulfilled" ? ratingsR.value : EMPTY_RATINGS,
      reviews: reviewsR.status === "fulfilled" ? reviewsR.value : EMPTY_REVIEWS,
      posts: postsR.status === "fulfilled" ? postsR.value : [],
      loading: false,
      error: null,
    });
  }, [hotelId]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  const submitRating = useCallback(
    async (count: number) => {
      const prev = state.ratings;
      setState((s) => ({
        ...s,
        ratings: {
          ...s.ratings,
          user_rating: s.ratings.user_rating
            ? { ...s.ratings.user_rating, rating_count: count }
            : null,
        },
      }));
      try {
        await rateHotel(hotelId, count);
        const fresh = await fetchHotelRatings(hotelId);
        setState((s) => ({ ...s, ratings: fresh }));
      } catch (err) {
        setState((s) => ({ ...s, ratings: prev }));
        throw err;
      }
    },
    [hotelId, state.ratings]
  );

  const submitReview = useCallback(
    async (text: string) => {
      await reviewHotel(hotelId, text);
      const fresh = await fetchHotelReviews(hotelId);
      setState((s) => ({ ...s, reviews: fresh }));
    },
    [hotelId]
  );

  return { ...state, refresh, submitRating, submitReview };
}
