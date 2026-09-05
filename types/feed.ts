export type PostMediaItem = {
  content_type: "image" | "video";
  category: "instant" | "video" | "photos";
  position: number;
  media_key: string;
  media_url: string;
  thumbnail_url: string;
};

export type Post = {
  id: number;
  description: string;
  media: PostMediaItem[];
  like_count: number;
  comment_count: number;
  avg_rating: number;
  rating_count: number;
  composite_score: number;
  is_liked: boolean;
  is_saved: boolean;
  /** True when the current user is the post's author. */
  is_mine: boolean;
  /** The author's per-category ratings (0 or 4 rows). */
  ratings: PostRatingItem[];
  created_at: string;
  user: { id: number; username: string };
  /** Post owner's avatar URL, or null/empty when unset. */
  avatar: string | null;
  /** Name of the hotel the post is about. */
  hotel_name: string | null;
  /** Google Maps URL for the post's hotel location, or null. */
  location_link: string | null;
  /** GeoJSON point of the post itself, or null. */
  location_point: GeoPoint | null;
};

export type RatingCategory = "food" | "service" | "cleanliness" | "value";

export const RATING_CATEGORIES: RatingCategory[] = [
  "food",
  "service",
  "cleanliness",
  "value",
];

export type PostRatingItem = {
  category: RatingCategory;
  score: number;
  review: string;
};

/** GeoJSON Point as serialized by the backend: coordinates are [lon, lat]. */
export type GeoPoint = { type: "Point"; coordinates: [number, number] };

export type Comment = {
  /** UUID string. Optimistic rows use a `temp-…` id until reconciled. */
  id: string;
  username: string;
  content: string;
  /** null when the commenter is a hotel. */
  avatar: string | null;
  created_at: string;
};

export type SavedPost = {
  id: number;
  media: PostMediaItem[];
};

export type Hotel = {
  id: number;
  name: string;
  address: string;
  city: string;
  phone_number: string;
  email: string;
  description: string;
  /**
   * Google Maps URL for the hotel's location (web platform), or a raw GeoJSON
   * point, or null. Normalise with `hotelMapsUrl()` in `lib/geo.ts`.
   */
  location: string | GeoPoint | null;
};

export type UploadUrl = { upload_url: string; key: string };

export type PostCreateMedia = {
  content_type: "image" | "video";
  category: "instant" | "video" | "photos";
  media_key: string;
  position?: number;
};

export type PostCreate = {
  hotel: number;
  description?: string;
  media: PostCreateMedia[];
  status?: "draft" | "published" | "archived";
  ratings: PostRatingItem[];
  post_type?: "regular" | "instant";
};

export type PostUpdate = {
  description?: string;
};

export type FeedState = {
  posts: Post[];
  loading: boolean;
  error: string | null;
};
