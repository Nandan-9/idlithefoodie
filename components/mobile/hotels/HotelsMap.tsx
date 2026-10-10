"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Hotel } from "@/types/feed";

// Turbopack can't bundle MapLibre's inline worker, so serve it from /public
// (copied from node_modules/maplibre-gl/dist/ along with maplibre-gl-shared.mjs;
// re-copy both after upgrading maplibre-gl).
maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
const BUILDINGS_LAYER = "hotels-3d-buildings";
// Trivandrum fallback when no hotel has coordinates.
const DEFAULT_CENTER: [number, number] = [76.9366, 8.5241];
// Hotel names under the pins only show from this zoom (street level) upward.
const LABEL_MIN_ZOOM = 14;

type Props = {
  hotels: Hotel[];
  is3D: boolean;
  onSelectHotel: (hotel: Hotel) => void;
};

type Pin = { hotel: Hotel; lngLat: [number, number] };

function toPins(hotels: Hotel[]): Pin[] {
  const pins: Pin[] = [];
  for (const hotel of hotels) {
    const loc = hotel.location;
    if (!loc || typeof loc === "string") continue;
    const [lon, lat] = loc.coordinates ?? [];
    if (typeof lon !== "number" || typeof lat !== "number") continue;
    pins.push({ hotel, lngLat: [lon, lat] });
  }
  return pins;
}

function boundsOf(pins: Pin[]): maplibregl.LngLatBounds | null {
  if (pins.length === 0) return null;
  const bounds = new maplibregl.LngLatBounds();
  pins.forEach((p) => bounds.extend(p.lngLat));
  return bounds;
}

function createPinElement(name: string): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", name);
  // Tip of the pin is at the bottom-centre of the viewBox, which is where the
  // marker's "bottom" anchor lands on the coordinate.
  btn.innerHTML = `<svg width="34" height="40" viewBox="0 0 40 47" style="display:block" aria-hidden="true">
    <path d="M20 45C20 45 3 30 3 18.5a17 17 0 1 1 34 0C37 30 20 45 20 45Z" fill="#6F2DBD" stroke="#fff" stroke-width="2.5"/>
    <circle cx="20" cy="18.5" r="6.5" fill="#fff"/>
  </svg>`;
  btn.style.cssText =
    "background:none;border:0;padding:0;cursor:pointer;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));";
  const label = document.createElement("span");
  label.textContent = name;
  label.style.cssText =
    "display:none;position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:2px;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;pointer-events:none;font:700 11px/1.2 system-ui,sans-serif;color:#2A1240;filter:none;text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 3px #fff,0 0 3px #fff;";
  btn.appendChild(label);
  return btn;
}

export default function HotelsMap({ hotels, is3D, onSelectHotel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const labelsRef = useRef<HTMLElement[]>([]);
  const labelsOnRef = useRef(false);
  const is3DRef = useRef(is3D);
  const onSelectRef = useRef(onSelectHotel);
  // Hotels known at mount, so the first camera position is already correct.
  const initialHotels = useRef(hotels);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    is3DRef.current = is3D;
    onSelectRef.current = onSelectHotel;
  }, [is3D, onSelectHotel]);

  // Create the map once.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const initialBounds = boundsOf(toPins(initialHotels.current));

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: el,
        style: STYLE_URL,
        center: DEFAULT_CENTER,
        zoom: 11,
        ...(initialBounds && {
          bounds: initialBounds,
          fitBoundsOptions: { padding: 60, maxZoom: 15 },
        }),
        maxZoom: 17,
        maxPitch: 75,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        attributionControl: false,
        // Longer, softer glide after a drag and a smoother velocity curve.
        dragPan: { deceleration: 1800, maxSpeed: 2000, linearity: 0.3 },
        // Keep more tiles in memory so panning/zooming back never re-fetches,
        // and shorten label/tile cross-fades so the map settles faster.
        maxTileCacheZoomLevels: 8,
        fadeDuration: 150,
        renderWorldCopies: false,
      });
    } catch {
      queueMicrotask(() => setFailed(true));
      return;
    }

    map.addControl(new maplibregl.AttributionControl({ compact: true }));
    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );
    // Keep the zoom/compass buttons clear of the search bar and tag chips.
    const topRight = el.querySelector<HTMLElement>(".maplibregl-ctrl-top-right");
    if (topRight) topRight.style.marginTop = "104px";

    const syncLabels = () => {
      const on = map.getZoom() >= LABEL_MIN_ZOOM;
      labelsOnRef.current = on;
      labelsRef.current.forEach((l) => {
        l.style.display = on ? "block" : "none";
      });
    };
    map.on("zoom", syncLabels);

    map.on("load", () => {
      map.addLayer({
        id: BUILDINGS_LAYER,
        source: "openmaptiles",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 14,
        layout: { visibility: is3DRef.current ? "visible" : "none" },
        paint: {
          "fill-extrusion-color": "#d9d4cc",
          "fill-extrusion-height": [
            "coalesce",
            ["get", "render_height"],
            8,
          ],
          "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
          // Must stay 1: any opacity < 1 forces an extra offscreen render pass.
          "fill-extrusion-opacity": 1,
        },
      });
      setReady(true);
    });
    map.on("error", (e) => {
      if (!map.loaded() && !map.getStyle()) setFailed(true);
      console.warn("MapLibre error", e.error);
    });

    mapRef.current = map;
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      labelsRef.current = [];
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  // 2D <-> 3D.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setLayoutProperty(
      BUILDINGS_LAYER,
      "visibility",
      is3D ? "visible" : "none"
    );
    map.easeTo({
      pitch: is3D ? 60 : 0,
      bearing: is3D ? -20 : 0,
      zoom: is3D ? Math.max(map.getZoom(), 15) : map.getZoom(),
      duration: 1100,
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    });
  }, [is3D, ready]);

  // Hotel pins.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    labelsRef.current = [];
    labelsOnRef.current = map.getZoom() >= LABEL_MIN_ZOOM;

    const pins = toPins(hotels);
    for (const { hotel, lngLat } of pins) {
      const el = createPinElement(hotel.name);
      el.addEventListener("click", () => onSelectRef.current(hotel));
      const label = el.lastElementChild as HTMLElement;
      label.style.display = labelsOnRef.current ? "block" : "none";
      labelsRef.current.push(label);

      const popup = new maplibregl.Popup({ offset: 30, closeButton: false })
        .setText(hotel.name);
      el.addEventListener("mouseenter", () => {
        if (!labelsOnRef.current) popup.setLngLat(lngLat).addTo(map);
      });
      el.addEventListener("mouseleave", () => popup.remove());

      markersRef.current.push(
        new maplibregl.Marker({
          element: el,
          anchor: "bottom",
          pitchAlignment: "viewport",
          rotationAlignment: "viewport",
        })
          .setLngLat(lngLat)
          .addTo(map)
      );
    }

    const bounds = boundsOf(pins);
    if (bounds) map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 0 });
  }, [hotels]);

  if (failed) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[#555]">
        The map couldn&apos;t load on this device. Switch to the list view.
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}
