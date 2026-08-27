/**
 * Normalise a backend Google Maps link into the official Maps URLs API form so
 * it resolves reliably when opened programmatically (a new tab / PWA webview
 * without a referrer). The backend sends the unofficial
 * `https://www.google.com/maps/place/?q=place_id:ChIJ...` shape, which Google
 * often fails to resolve outside a normal browser session ("no results found").
 *
 * See https://developers.google.com/maps/documentation/urls/get-started —
 * `query` is required alongside `query_place_id`.
 *
 * Falls back to the raw URL if no place id can be extracted.
 */
import type { GeoPoint } from "@/types/feed";

/**
 * Resolve a hotel's `location` (either a backend Google Maps URL string, a raw
 * GeoJSON point with `[lon, lat]` coordinates, or null) into an openable Google
 * Maps URL. Returns null when there is nothing to open.
 */
export function hotelMapsUrl(
  location: string | GeoPoint | null | undefined,
  label?: string
): string | null {
  if (!location) return null;
  if (typeof location === "string") {
    return location.length > 0 ? toGoogleMapsUrl(location, label) : null;
  }
  const coords = location.coordinates;
  if (!coords || coords.length < 2) return null;
  const [lon, lat] = coords;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}

export function toGoogleMapsUrl(raw: string, label?: string): string {
  try {
    const u = new URL(raw);
    const q = u.searchParams.get("q") ?? "";
    const placeId =
      u.searchParams.get("query_place_id") ??
      (q.startsWith("place_id:") ? q.slice("place_id:".length) : null);
    if (placeId) {
      const query = encodeURIComponent(label?.trim() || placeId);
      return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${placeId}`;
    }
  } catch {
    /* not a URL — fall through */
  }
  return raw;
}
