export type Post = {
  id: number;
  title: string;
  description: string;
  media_url: string;
  thumbnail_url: string;
  media_type: "image" | "video";
  like_count: number;
  comment_count: number;
  avg_rating: number;
  rating_count: number;
  composite_score: number;
  is_liked: boolean;
  is_saved: boolean;
  created_at: string;
  user: { id: number; username: string };
  /** Post owner's avatar URL, or null/empty when unset. */
  avatar: string | null;
  /** Name of the hotel the post is about. */
  hotel_name: string | null;
  /** Google Maps URL for the post's location, or null. */
  location: string | null;
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
  thumbnail_url: string;
  media_type: "image" | "video";
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

export type PostCreate = {
  hotel: number;
  food_spot?: number | null;
  title: string;
  description?: string;
  media_type: "image" | "video";
  raw_s3_key: string;
  status?: "draft" | "published" | "archived";
};

export type FeedState = {
  posts: Post[];
  loading: boolean;
  error: string | null;
};
