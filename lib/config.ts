/**
 * Base URL of the backend API. Every request and OAuth redirect is built from
 * this. `NEXT_PUBLIC_BASE_URL` is inlined at build time — if the deploy is built
 * without it, the value here is empty and requests resolve against the frontend
 * origin (e.g. `https://idli.food/auth/google/login/`), which has no such route
 * and 404s. Trailing slash is stripped so callers can safely prefix `/path`.
 */
export const API_BASE = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");

/** True when the backend base URL was baked into this build. */
export const isApiConfigured = API_BASE.length > 0;

if (!isApiConfigured && typeof window !== "undefined") {
  console.error(
    "[config] NEXT_PUBLIC_BASE_URL is not set. API and Google OAuth requests " +
      "will hit the frontend origin and 404. Set it in the deployment " +
      "environment and rebuild.",
  );
}

/**
 * Throw a clear, user-surfaceable error when the API base URL is missing.
 * Call this before kicking off a network request or full-page auth redirect so
 * the user sees a real message instead of a bare 404 page.
 */
export function assertApiConfigured(): void {
  if (!isApiConfigured) {
    throw new Error(
      "Sign-in is temporarily unavailable (API endpoint is not configured). " +
        "Please try again later.",
    );
  }
}
