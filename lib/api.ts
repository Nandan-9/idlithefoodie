import { API_BASE as BASE } from "./config";
import type {
  Post,
  Comment,
  Hotel,
  UploadUrl,
  PostCreate,
  SavedPost,
} from "@/types/feed";
import type {
  Profile,
  ProfileUpdate,
  ProfileCompletion,
} from "@/types/profile";
import type {
  HotelProfile,
  HotelRating,
  HotelRatingsSummary,
  HotelReview,
  HotelReviewsData,
} from "@/types/hotel";

/**
 * Thrown when a request could not be authenticated even after refreshing.
 * (Historically `AuthError`; kept as an alias.)
 */
export class SessionExpiredError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "SessionExpiredError";
  }
}

/** @deprecated use `SessionExpiredError` */
export const AuthError = SessionExpiredError;

/** Thrown when the profile update endpoint rejects the payload. */
export class ProfileValidationError extends Error {
  errors: Record<string, string[]> | null;
  constructor(message: string, errors: Record<string, string[]> | null) {
    super(message);
    this.name = "ProfileValidationError";
    this.errors = errors;
  }
}

/** Thrown when the create-post / upload-url endpoints reject the payload. */
export class PostValidationError extends Error {
  errors: Record<string, string[]> | string | null;
  constructor(
    message: string,
    errors: Record<string, string[]> | string | null
  ) {
    super(message);
    this.name = "PostValidationError";
    this.errors = errors;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Ask the backend to rotate the `access_token` cookie using the `refresh_token`
 * cookie. Auth is entirely cookie-based — no token ever passes through JS — so
 * this sends no body and just reports whether the rotation succeeded.
 * Single-flight: concurrent callers share one network request.
 */
function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = fetch(`${BASE}/auth/refresh/`, {
    method: "POST",
    credentials: "include",
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

function withDefaults(init: RequestInit | undefined): RequestInit {
  return {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  };
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = `${BASE}${path}`;
  let res = await fetch(url, withDefaults(init));

  if ((res.status === 401 || res.status === 403) && path !== "/auth/refresh/") {
    if (await refreshSession()) {
      res = await fetch(url, withDefaults(init));
      if (res.status !== 401 && res.status !== 403) return res;
    }
    throw new SessionExpiredError();
  }

  return res;
}

/** The current user, from the `access_token` cookie. Throws `SessionExpiredError` if anon. */
export async function fetchMe(): Promise<{
  id: number;
  username: string;
  phone_number: string;
}> {
  const res = await apiFetch(`/auth/me/`);
  if (!res.ok) throw new SessionExpiredError();
  const body = await res.json().catch(() => null);
  const data = body?.data ?? body;
  if (!data?.id) throw new SessionExpiredError();
  return data;
}

/** Clear the auth cookies server-side. Best-effort — never throws. */
export async function logoutRequest(): Promise<void> {
  try {
    await fetch(`${BASE}/auth/logout/`, { method: "POST", credentials: "include" });
  } catch {
    /* ignore */
  }
}

export async function fetchFeed(): Promise<Post[]> {
  const res = await apiFetch(`/feed/?platform=web`);
  if (!res.ok) throw new Error("Failed to load feed");
  return res.json();
}

/**
 * Like/save toggles. Each returns the *authoritative* resulting state so the
 * caller can reconcile its optimistic UI rather than blindly flipping a flag
 * that may have drifted from the server (e.g. the feed payload omitting
 * `is_liked` / `is_saved`).
 *
 * The backend is idempotent-hostile: POSTing a like/save that already exists
 * comes back 400 with a unique-constraint error ("The fields user, post must
 * make a unique set."), and DELETEing one that doesn't exist comes back 404 /
 * "not found". Those are not real errors — the requested end state already
 * holds — so we map them to the corresponding boolean instead of throwing,
 * otherwise the optimistic UI reverts and the next tap re-sends POST.
 */
export async function likePost(id: number): Promise<boolean> {
  const res = await apiFetch(`/post/${id}/like/`, { method: "POST" });
  if (res.ok) return true;
  if (res.status === 400 && /already liked|unique set/i.test(await errorText(res)))
    return true;
  throw new Error("Like failed");
}

export async function unlikePost(id: number): Promise<boolean> {
  const res = await apiFetch(`/post/${id}/like/`, { method: "DELETE" });
  if (res.ok || res.status === 404) return false;
  if (/have not liked|not liked|does not exist|not found/i.test(await errorText(res)))
    return false;
  throw new Error("Unlike failed");
}

export async function savePost(id: number): Promise<boolean> {
  const res = await apiFetch(`/post/${id}/save/`, { method: "POST" });
  if (res.ok) return true;
  if (res.status === 400 && /already saved|unique set/i.test(await errorText(res)))
    return true;
  throw new Error("Save failed");
}

export async function unsavePost(id: number): Promise<boolean> {
  const res = await apiFetch(`/post/${id}/save/`, { method: "DELETE" });
  if (res.ok || res.status === 404) return false;
  if (/have not saved|not saved|does not exist|not found/i.test(await errorText(res)))
    return false;
  throw new Error("Unsave failed");
}

/**
 * Flatten an error envelope's human-readable strings — `message` plus every
 * value in `errors` (DRF puts non-field validation errors under
 * `errors.non_field_errors`) — into one string for loose matching.
 */
async function errorText(res: Response): Promise<string> {
  try {
    const body = await res.clone().json();
    const parts: unknown[] = [body?.message];
    const errors = body?.errors;
    if (typeof errors === "string") {
      parts.push(errors);
    } else if (errors && typeof errors === "object") {
      for (const value of Object.values(errors)) {
        parts.push(...(Array.isArray(value) ? value : [value]));
      }
    }
    return parts.filter((s): s is string => typeof s === "string").join(" ");
  } catch {
    return "";
  }
}

/** Current user's profile. This endpoint returns the raw serializer (no envelope). */
export async function fetchProfile(): Promise<Profile> {
  const res = await apiFetch(`/accounts/profile/`);
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

/** Partial update of the current user's profile. Only send the fields that changed. */
export async function updateProfile(
  patch: ProfileUpdate
): Promise<ProfileCompletion> {
  const res = await apiFetch(`/accounts/profile/complete/`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

  let json: {
    success?: boolean;
    message?: string;
    errors?: Record<string, string[]>;
    data?: ProfileCompletion;
  } | null = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok || json?.success === false) {
    throw new ProfileValidationError(
      json?.message ?? "Failed to update profile",
      json?.errors ?? null
    );
  }

  return json?.data as ProfileCompletion;
}

/** Parse the standard `{ success, message, data, errors }` envelope, or throw. */
async function unwrapEnvelope<T>(res: Response, fallback: string): Promise<T> {
  let json: {
    success?: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]> | string;
  } | null = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok || json?.success === false) {
    throw new PostValidationError(
      json?.message ?? fallback,
      json?.errors ?? null
    );
  }
  return json?.data as T;
}

/** All hotels (flat array, no pagination). */
export async function fetchHotels(): Promise<Hotel[]> {
  const res = await apiFetch(`/hotel/list/?platform=web`);
  return unwrapEnvelope<Hotel[]>(res, "Failed to load hotels");
}

/** Step 1: get a presigned S3 PUT URL bound to the exact content type. */
export async function getUploadUrl(
  file_name: string,
  content_type: string
): Promise<UploadUrl> {
  const res = await apiFetch(`/post/content/upload-url/`, {
    method: "POST",
    body: JSON.stringify({ file_name, content_type }),
  });
  return unwrapEnvelope<UploadUrl>(res, "Could not start upload");
}

/**
 * Step 2: PUT the raw file straight to S3. Not routed through `apiFetch` —
 * no auth header, and Content-Type must match `file.type` exactly or S3
 * returns 403 SignatureDoesNotMatch.
 */
export async function uploadFileToS3(
  uploadUrl: string,
  file: File
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("Upload to storage failed");
}

/** Step 3: create the post referencing the uploaded object. */
export async function createPost(payload: PostCreate): Promise<Post> {
  const res = await apiFetch(`/post/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await unwrapEnvelope<{ post: Post }>(res, "Failed to create post");
  return data.post;
}

export async function fetchComments(id: number): Promise<Comment[]> {
  const res = await apiFetch(`/post/${id}/comment/`);
  return unwrapEnvelope<Comment[]>(res, "Failed to load comments");
}

/** Add a comment. The endpoint returns no object (`data: null`). */
export async function postComment(id: number, content: string): Promise<void> {
  const res = await apiFetch(`/post/${id}/comment/`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  await unwrapEnvelope<null>(res, "Failed to post comment");
}

/** Delete one of your own comments. 404 if it isn't yours. */
export async function deleteComment(
  postId: number,
  commentId: string
): Promise<void> {
  const res = await apiFetch(`/post/${postId}/comment/${commentId}/`, {
    method: "DELETE",
  });
  await unwrapEnvelope<null>(res, "Failed to delete comment");
}

/** The current user's saved posts (grid view). */
export async function fetchSavedPosts(): Promise<SavedPost[]> {
  const res = await apiFetch(`/post/saved/me/`);
  return unwrapEnvelope<SavedPost[]>(res, "Failed to load saved posts");
}

/** Public profile for one hotel. 404 → thrown as PostValidationError. */
export async function fetchHotelProfile(id: number): Promise<HotelProfile> {
  const res = await apiFetch(`/hotel/profile/${id}/?platform=web`);
  return unwrapEnvelope<HotelProfile>(res, "Hotel not found");
}

/** Rating summary for a hotel plus the caller's own rating (if any). */
export async function fetchHotelRatings(
  id: number
): Promise<HotelRatingsSummary> {
  const res = await apiFetch(`/hotel/${id}/rating/`);
  return unwrapEnvelope<HotelRatingsSummary>(res, "Failed to load ratings");
}

/** Upsert the caller's 1–5 rating for a hotel. */
export async function rateHotel(
  id: number,
  rating_count: number
): Promise<HotelRating> {
  const res = await apiFetch(`/hotel/${id}/rating/`, {
    method: "POST",
    body: JSON.stringify({ rating_count }),
  });
  return unwrapEnvelope<HotelRating>(res, "Failed to save rating");
}

/** All reviews for a hotel (newest first) plus the caller's own review. */
export async function fetchHotelReviews(id: number): Promise<HotelReviewsData> {
  const res = await apiFetch(`/hotel/${id}/review/`);
  return unwrapEnvelope<HotelReviewsData>(res, "Failed to load reviews");
}

/** Upsert the caller's review for a hotel. */
export async function reviewHotel(
  id: number,
  review_text: string
): Promise<HotelReview> {
  const res = await apiFetch(`/hotel/${id}/review/`, {
    method: "POST",
    body: JSON.stringify({ review_text }),
  });
  return unwrapEnvelope<HotelReview>(res, "Failed to save review");
}

/** All published posts authored by a hotel (feed shape). */
export async function fetchHotelPosts(id: number): Promise<Post[]> {
  const res = await apiFetch(`/post/author/?view=feed`, {
    method: "POST",
    body: JSON.stringify({ hotel_id: id }),
  });
  return unwrapEnvelope<Post[]>(res, "Failed to load posts");
}

/** All published posts authored by a user (feed shape). */
export async function fetchUserPosts(userId: number): Promise<Post[]> {
  const res = await apiFetch(`/post/author/?view=feed`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
  return unwrapEnvelope<Post[]>(res, "Failed to load posts");
}
