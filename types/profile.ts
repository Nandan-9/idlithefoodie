export type Diet = "" | "veg" | "non_veg";

export type Profile = {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  /** ISO `YYYY-MM-DD`, or "" when unset. Only returned for the current user. */
  dob: string;
  /** Only returned for the current user. */
  diet: Diet;
  /** Free text, max 100 chars. Only returned for the current user. */
  food_preference: string;
  total_post: number;
  total_likes: number;
  total_stars: number;
  total_rating: number;
  is_verified: boolean;
  completion_percentage: number;
  incomplete_fields: string[];
  is_profile_complete: boolean;
};

export type ProfileUpdate = Partial<{
  name: string;
  bio: string;
  /** `null` clears a previously set date of birth. */
  dob: string | null;
  diet: Diet;
  food_preference: string;
  /** S3 object key returned by `getAvatarUploadUrl`, not a URL. */
  avatar: string;
  lat: number;
  lon: number;
}>;

export type ProfileCompletion = Pick<
  Profile,
  "completion_percentage" | "incomplete_fields" | "is_profile_complete"
>;

export type ProfileState = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
};
