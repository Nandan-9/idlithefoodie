"use client";

type Props = {
  title: string;
  subtitle?: string;
  lat?: number;
  lon?: number;
  onClose: () => void;
};

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export default function MapView({ title, subtitle, lat, lon, onClose }: Props) {
  const hasCoords = lat !== undefined && lon !== undefined;

  // Google Maps Embed API — interactive map, no billing required.
  // Needs "Maps Embed API" enabled on the key.
  const embedSrc =
    hasCoords && MAPS_KEY
      ? `https://www.google.com/maps/embed/v1/view?key=${MAPS_KEY}&center=${lat},${lon}&zoom=16&maptype=roadmap`
      : null;
  const externalLink = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
    : null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-[#1a0a2e] rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#6F2DBD]">
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{title}</p>
            {subtitle && (
              <p className="text-white/70 text-xs mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close map"
            className="text-white/80 p-1 shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Map */}
        {embedSrc ? (
          <iframe
            title={`Map for ${title}`}
            src={embedSrc}
            className="w-full border-0"
            style={{ aspectRatio: "3/2" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div
            className="w-full flex flex-col items-center justify-center gap-2"
            style={{ aspectRatio: "3/2", background: "#160930" }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6F2DBD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <p className="text-[#c7b8ea] text-sm text-center px-4">
              {hasCoords
                ? "Map unavailable — check the Google Maps API key"
                : "Exact coordinates not available for this post"}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 flex items-center justify-between gap-2 min-w-0">
          <span className="text-[#9B8DC4] text-xs truncate">
            {hasCoords ? `${lat!.toFixed(5)}, ${lon!.toFixed(5)}` : title}
          </span>
          {externalLink && (
            <a
              href={externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C7B8EA] text-xs font-semibold shrink-0 underline"
            >
              Open in Google Maps
            </a>
          )}
        </div>
      </div>
    </>
  );
}
