@AGENTS.md

# Web UI conventions

- **Locations**: in the web UI open maps via `hotelMapsUrl()` / `toGoogleMapsUrl()`
  in `lib/geo.ts`, which prefer the backend-provided location URL string (the
  `location` returned with `?platform=web`) over raw GeoJSON pin coordinates.
  Open with `window.open(url, "_blank")` — never an `<a href>` that the router can
  intercept.
