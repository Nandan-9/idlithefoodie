export type Profile = {
  username: string;
  name: string;
  avatar: string;
  bio: string;
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
  dob: string;
  diet: string;
  food_preference: string;
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
