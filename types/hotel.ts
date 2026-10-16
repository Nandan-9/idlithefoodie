import type { GeoPoint } from "./feed";

export type HotelProfile = {
  name: string;
  address: string;
  city?: string;
  phone_number: string;
  avatar: string | null;
  location: GeoPoint | null;
  location_link: string | null;
  profile_completion: number;
  is_verified?: boolean;
  price_min: string | null;
  price_max: string | null;
  hours: string | null;
  atmosphere: string | null;
  best_for: string | null;
  cuisines: string[];
  services: string[];
  facilities: string[];
  dishes: string[];
};

export type HotelUserRef = {
  id: number;
  username: string;
  avatar: string | null;
};

export type HotelRating = {
  id: number;
  user: HotelUserRef;
  hotel: number;
  rating_count: number;
  created_at: string;
};

export type HotelReview = {
  id: number;
  user: HotelUserRef;
  hotel: number;
  review_text: string;
  created_at: string;
};

export type HotelRatingsSummary = {
  average_rating: number | null;
  rating_count: number;
  user_rating: HotelRating | null;
};

export type HotelReviewsData = {
  reviews: HotelReview[];
  user_review: HotelReview | null;
};
