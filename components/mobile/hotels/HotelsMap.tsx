"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Hotel } from "@/types/feed";
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  STYLE_URL,
} from "@/lib/mapConfig";
import styles from "./HotelsMap.module.css";

// Turbopack can't bundle MapLibre's inline worker, so serve it from /public
// (copied from node_modules/maplibre-gl/dist/ along with maplibre-gl-shared.mjs;
// re-copy both after upgrading maplibre-gl).
maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

const BUILDINGS_LAYER = "hotels-3d-buildings";
const SRC_HOTELS = "hotels";
const SRC_SELECTED = "hotel-selected";
const L_CLUSTERS = "hotel-clusters";
const L_CLUSTER_COUNT = "hotel-cluster-count";
const L_PINS = "hotel-pins";
const L_LABELS = "hotel-labels";
const L_PIN_HIT = "hotel-pin-hit";
const FONT = ["Noto Sans Bold"];
const BRAND = "#6F2DBD";
const INK = "#2A1240";
// Hotel names under the pins only show from this zoom (street level) upward.
const LABEL_MIN_ZOOM = 14;

type Props = {
  hotels: Hotel[];
  /** The open hotel, highlighted on the map and flown to. */
  selected: Hotel | null;
  is3D: boolean;
  /** Re-frame the map around the hotels whenever they change (search / tag). */
  autoFit: boolean;
  /** Fraction of the map height covered by the bottom sheet. */
  bottomFrac: number;
  onToggle3D: () => void;
  onSelectHotel: (hotel: Hotel) => void;
  /** Hotel ids inside the viewport, nearest to the map centre first. */
  onViewChange: (ids: number[]) => void;
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

function toCollection(pins: Pin[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: pins.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: p.lngLat },
      properties: { id: p.hotel.id, name: p.hotel.name },
    })),
  };
}

// Photo cards are DOM markers, so only build them for the unclustered pins
// actually on screen, and re-check at most this often while the map moves.
const CARD_SYNC_MS = 120;
const CARD_STACK = 3;

// A card's footprint on screen, used to keep cards from piling on each other.
const CARD_W = 50;
const CARD_H = 56;

type Card = {
  marker: maplibregl.Marker;
  /** The bare element MapLibre positions; never style its transform. */
  root: HTMLDivElement;
  /** The visible card inside it, free to animate. */
  el: HTMLButtonElement;
  key: string;
};

const cardKey = (hotel: Hotel) => (hotel.thumbnails ?? []).slice(0, CARD_STACK).join("|");

/** A tiny stack of post photos that sits on top of a hotel's pin. */
function buildCard(hotel: Hotel, onPick: (id: number) => void): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.className = styles.snap;
  el.setAttribute("aria-label", `Open ${hotel.name}`);
  const shots = (hotel.thumbnails ?? []).slice(0, CARD_STACK);
  const layers = [styles.front, styles.back1, styles.back2];
  shots.forEach((src, i) => {
    const card = document.createElement("span");
    card.className = `${styles.card} ${layers[i]}`;
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.decoding = "async";
    // Only the front photo matters for the first paint.
    if (i > 0) img.setAttribute("fetchpriority", "low");
    img.draggable = false;
    // A broken photo leaves the tinted frame rather than a broken-image icon.
    img.onerror = () => img.remove();
    card.appendChild(img);
    el.appendChild(card);
  });
  const tail = document.createElement("span");
  tail.className = styles.tail;
  el.appendChild(tail);
  // Panning the map can start on a card; only a tap that stays put opens it.
  let downX = 0;
  let downY = 0;
  el.addEventListener("pointerdown", (e) => {
    downX = e.clientX;
    downY = e.clientY;
  });
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    if (e.detail > 0 && Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
    onPick(hotel.id);
  });
  return el;
}

const EASE_IN_OUT = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const ctrlBtn =
  "pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#6F2DBD] shadow-[0_2px_10px_rgba(42,18,64,0.22)] transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F2DBD]";

export default function HotelsMap({
  hotels,
  selected,
  is3D,
  autoFit,
  bottomFrac,
  onToggle3D,
  onSelectHotel,
  onViewChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const pinsRef = useRef<Pin[]>([]);
  const byIdRef = useRef<Map<number, Hotel>>(new Map());
  const lngLatRef = useRef<Map<number, [number, number]>>(new Map());
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const cardsRef = useRef<Map<number, Card>>(new Map());
  const selectedIdRef = useRef<number | null>(null);
  const is3DRef = useRef(is3D);
  const bottomFracRef = useRef(bottomFrac);
  const autoFitRef = useRef(autoFit);
  const hasSelectedRef = useRef(false);
  const onSelectRef = useRef(onSelectHotel);
  const onViewRef = useRef(onViewChange);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [bearing, setBearing] = useState(0);
  const [locating, setLocating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    is3DRef.current = is3D;
    bottomFracRef.current = bottomFrac;
    autoFitRef.current = autoFit;
    hasSelectedRef.current = selected !== null;
    onSelectRef.current = onSelectHotel;
    onViewRef.current = onViewChange;
  }, [is3D, autoFit, bottomFrac, selected, onSelectHotel, onViewChange]);

  // Create the map once.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: el,
        style: STYLE_URL,
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
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

    // Report which hotels are in view (nearest the centre first) once the
    // camera settles, so the list can follow the map.
    const reportView = () => {
      const b = map.getBounds();
      const c = map.getCenter();
      const inView = pinsRef.current
        .filter((p) => b.contains(p.lngLat))
        .map((p) => ({
          id: p.hotel.id,
          d: (p.lngLat[0] - c.lng) ** 2 + (p.lngLat[1] - c.lat) ** 2,
        }))
        .sort((a, z) => a.d - z.d)
        .map((p) => p.id);
      onViewRef.current(inView);
    };
    map.on("moveend", reportView);
    map.on("rotate", () => setBearing(map.getBearing()));

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
          "fill-extrusion-height": ["coalesce", ["get", "render_height"], 8],
          "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
          // Must stay 1: any opacity < 1 forces an extra offscreen render pass.
          "fill-extrusion-opacity": 1,
        },
      });

      // Pins are GeoJSON layers drawn by the GPU, not DOM markers, so panning
      // stays smooth with hundreds of hotels and nearby ones cluster.
      map.addSource(SRC_HOTELS, {
        type: "geojson",
        data: toCollection([]),
        cluster: true,
        clusterRadius: 48,
        clusterMaxZoom: 13,
      });
      map.addSource(SRC_SELECTED, { type: "geojson", data: toCollection([]) });

      map.addLayer({
        id: L_CLUSTERS,
        type: "circle",
        source: SRC_HOTELS,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": BRAND,
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 22, 50, 28],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#fff",
        },
      });
      map.addLayer({
        id: L_CLUSTER_COUNT,
        type: "symbol",
        source: SRC_HOTELS,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": FONT,
          "text-size": 13,
          "text-allow-overlap": true,
        },
        paint: { "text-color": "#fff" },
      });
      map.addLayer({
        id: L_PINS,
        type: "circle",
        source: SRC_HOTELS,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": BRAND,
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 7, 16, 11],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#fff",
        },
      });
      // Invisible, larger tap target so small pins are easy to hit on a phone.
      map.addLayer({
        id: L_PIN_HIT,
        type: "circle",
        source: SRC_HOTELS,
        filter: ["!", ["has", "point_count"]],
        paint: { "circle-radius": 22, "circle-opacity": 0 },
      });
      map.addLayer({
        id: L_LABELS,
        type: "symbol",
        source: SRC_HOTELS,
        minzoom: LABEL_MIN_ZOOM,
        filter: ["!", ["has", "point_count"]],
        layout: {
          "text-field": ["get", "name"],
          "text-font": FONT,
          "text-size": 11.5,
          "text-anchor": "top",
          "text-offset": [0, 1.1],
          "text-max-width": 8,
          "text-optional": true,
        },
        paint: {
          "text-color": INK,
          "text-halo-color": "#fff",
          "text-halo-width": 1.6,
        },
      });
      // The open hotel: halo + larger pin, always on top and never clustered.
      map.addLayer({
        id: "hotel-selected-halo",
        type: "circle",
        source: SRC_SELECTED,
        paint: { "circle-color": BRAND, "circle-opacity": 0.22, "circle-radius": 26 },
      });
      map.addLayer({
        id: "hotel-selected-pin",
        type: "circle",
        source: SRC_SELECTED,
        paint: {
          "circle-color": BRAND,
          "circle-radius": 13,
          "circle-stroke-width": 4,
          "circle-stroke-color": "#fff",
        },
      });

      const pointer = () => (map.getCanvas().style.cursor = "pointer");
      const reset = () => (map.getCanvas().style.cursor = "");
      for (const id of [L_CLUSTERS, L_PIN_HIT, "hotel-selected-pin"]) {
        map.on("mouseenter", id, pointer);
        map.on("mouseleave", id, reset);
      }

      map.on("click", L_CLUSTERS, async (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const src = map.getSource(SRC_HOTELS) as maplibregl.GeoJSONSource;
        try {
          const zoom = await src.getClusterExpansionZoom(f.properties.cluster_id);
          map.easeTo({
            center: (f.geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: Math.min(zoom + 0.5, map.getMaxZoom()),
            duration: 450,
            easing: EASE_IN_OUT,
          });
        } catch {
          /* cluster vanished mid-tap */
        }
      });
      const pick = (e: maplibregl.MapLayerMouseEvent) => {
        const hotel = byIdRef.current.get(Number(e.features?.[0]?.properties.id));
        if (hotel) onSelectRef.current(hotel);
      };
      map.on("click", L_PIN_HIT, pick);
      map.on("click", "hotel-selected-pin", pick);

      // Keep a photo card above every unclustered pin on screen that has
      // posts. Throttled on render, with a final pass once the map is idle.
      const pickById = (id: number) => {
        const hotel = byIdRef.current.get(id);
        if (hotel) onSelectRef.current(hotel);
      };
      const syncCards = () => {
        const cards = cardsRef.current;
        const selectedId = selectedIdRef.current;
        const seen = new Set<number>();
        for (const f of map.queryRenderedFeatures({ layers: [L_PINS] })) {
          const id = Number(f.properties.id);
          if (seen.has(id)) continue;
          // Rendered features can lag a setData by a frame; trust only hotels
          // in the current list.
          const hotel = byIdRef.current.get(id);
          if (!hotel?.thumbnails?.length) continue;
          seen.add(id);
          if (cards.has(id)) continue;
          // Anchor to the hotel's exact coordinates, not the tile-rounded
          // geometry of the rendered feature.
          const lngLat = lngLatRef.current.get(id);
          if (!lngLat) continue;
          const el = buildCard(hotel, pickById);
          el.classList.toggle(styles.selected, id === selectedId);
          // MapLibre moves markers by writing `transform` on this element, so
          // it stays bare and all card styling lives on the child.
          const root = document.createElement("div");
          root.className = styles.anchor;
          root.appendChild(el);
          const marker = new maplibregl.Marker({
            element: root,
            anchor: "bottom",
            offset: [0, -17],
          })
            .setLngLat(lngLat)
            .addTo(map);
          cards.set(id, { marker, root, el, key: cardKey(hotel) });
        }
        // The selected hotel's pin is drawn by its own layer, so keep its card.
        for (const [id, card] of cards) {
          if (seen.has(id) || id === selectedId) continue;
          card.marker.remove();
          cards.delete(id);
        }
        // Where cards would overlap, keep the selected one, then the hotel
        // with more posts, then the one nearer the viewer (further south);
        // the rest step back to just their pins until there's room.
        const ranked = [...cards.entries()]
          .map(([id, card]) => {
            const ll = card.marker.getLngLat();
            return { id, card, lat: ll.lat, pt: map.project(ll) };
          })
          .sort(
            (a, z) =>
              Number(z.id === selectedId) - Number(a.id === selectedId) ||
              (byIdRef.current.get(z.id)?.thumbnails?.length ?? 0) -
                (byIdRef.current.get(a.id)?.thumbnails?.length ?? 0) ||
              a.lat - z.lat
          );
        const kept: maplibregl.Point[] = [];
        for (const { id, card, lat, pt } of ranked) {
          const clash = kept.some(
            (k) => Math.abs(k.x - pt.x) < CARD_W && Math.abs(k.y - pt.y) < CARD_H
          );
          if (!clash) kept.push(pt);
          card.root.classList.toggle(styles.tucked, clash);
          // Southern cards overlap northern ones, like objects nearer the viewer.
          card.root.style.zIndex =
            id === selectedId ? "1000" : String(Math.round(500 - lat * 5));
        }
      };
      let lastSync = 0;
      map.on("render", () => {
        const now = performance.now();
        if (now - lastSync < CARD_SYNC_MS) return;
        lastSync = now;
        syncCards();
      });
      map.on("idle", syncCards);

      setReady(true);
    });
    map.on("error", (e) => {
      if (!map.loaded() && !map.getStyle()) setFailed(true);
      console.warn("MapLibre error", e.error);
    });

    mapRef.current = map;
    const cards = cardsRef.current;
    return () => {
      cards.forEach((c) => c.marker.remove());
      cards.clear();
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
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
      easing: EASE_IN_OUT,
    });
  }, [is3D, ready]);

  // Hotel pins: update the source in place instead of rebuilding anything.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const pins = toPins(hotels);
    pinsRef.current = pins;
    byIdRef.current = new Map(hotels.map((h) => [h.id, h]));
    // Keep cards whose hotel and photos are unchanged so a refresh or a new
    // filter doesn't make every card blink; the rest rebuild on next render.
    lngLatRef.current = new Map(pins.map((p) => [p.hotel.id, p.lngLat]));
    cardsRef.current.forEach((c, id) => {
      const hotel = byIdRef.current.get(id);
      const lngLat = lngLatRef.current.get(id);
      const ll = c.marker.getLngLat();
      if (
        hotel &&
        lngLat &&
        lngLat[0] === ll.lng &&
        lngLat[1] === ll.lat &&
        cardKey(hotel) === c.key
      )
        return;
      c.marker.remove();
      cardsRef.current.delete(id);
    });
    (map.getSource(SRC_HOTELS) as maplibregl.GeoJSONSource).setData(
      toCollection(pins)
    );

    const bounds = boundsOf(pins);
    if (bounds && autoFitRef.current && !hasSelectedRef.current) {
      const bottom = (containerRef.current?.clientHeight ?? 0) * bottomFracRef.current;
      map.fitBounds(bounds, {
        padding: { top: 130, bottom: bottom + 40, left: 40, right: 40 },
        maxZoom: 15,
        duration: 450,
      });
    } else {
      // Camera may not move (no pins / same bounds), so report explicitly.
      map.fire("moveend");
    }
  }, [hotels, ready]);

  // Highlight the open hotel and bring it above the bottom sheet.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const pins = selected ? toPins([selected]) : [];
    (map.getSource(SRC_SELECTED) as maplibregl.GeoJSONSource).setData(
      toCollection(pins)
    );
    selectedIdRef.current = selected?.id ?? null;
    cardsRef.current.forEach((c, id) =>
      c.el.classList.toggle(styles.selected, id === selected?.id)
    );
    map.triggerRepaint();
    if (pins[0]) {
      const h = containerRef.current?.clientHeight ?? 0;
      map.easeTo({
        center: pins[0].lngLat,
        zoom: Math.max(map.getZoom(), 15),
        offset: [0, -(h * bottomFracRef.current) / 2],
        duration: 700,
        easing: EASE_IN_OUT,
      });
    }
  }, [selected, ready]);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }

  function locate() {
    const map = mapRef.current;
    if (!map || locating) return;
    if (!navigator.geolocation) {
      flash("Location isn't available on this device");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        const lngLat: [number, number] = [coords.longitude, coords.latitude];
        if (!userMarkerRef.current) {
          const dot = document.createElement("div");
          dot.setAttribute("aria-hidden", "true");
          dot.style.cssText =
            "width:18px;height:18px;border-radius:50%;background:#2F6BFF;border:3px solid #fff;box-shadow:0 0 0 6px rgba(47,107,255,.25),0 1px 4px rgba(0,0,0,.4);";
          userMarkerRef.current = new maplibregl.Marker({ element: dot });
        }
        userMarkerRef.current.setLngLat(lngLat).addTo(map);
        const h = containerRef.current?.clientHeight ?? 0;
        map.flyTo({
          center: lngLat,
          zoom: Math.max(map.getZoom(), 14),
          offset: [0, -(h * bottomFracRef.current) / 2],
          essential: true,
        });
      },
      () => {
        setLocating(false);
        flash("Allow location access to find hotels near you");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }

  if (failed) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[#555]">
        The map couldn&apos;t load on this device. Check your connection and reload.
      </div>
    );
  }

  const map = () => mapRef.current;

  return (
    // `isolate` keeps the photo cards' z-indexes inside the map, under the sheet.
    <div className="relative isolate h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {/* Map controls, in one column under the search bar and tag chips. */}
      <div className="pointer-events-none absolute right-3 top-[112px] z-10 flex flex-col items-center gap-2">
        <div className="pointer-events-auto flex flex-col overflow-hidden rounded-full bg-white shadow-[0_2px_10px_rgba(42,18,64,0.22)]">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => map()?.zoomIn({ duration: 250 })}
            className="flex h-11 w-11 items-center justify-center text-[#6F2DBD] active:bg-[#F3EEFB] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#6F2DBD]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <span className="mx-2.5 h-px bg-[#E5E0F5]" />
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => map()?.zoomOut({ duration: 250 })}
            className="flex h-11 w-11 items-center justify-center text-[#6F2DBD] active:bg-[#F3EEFB] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#6F2DBD]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={onToggle3D}
          aria-pressed={is3D}
          aria-label={is3D ? "Switch to 2D map" : "Switch to 3D map"}
          className={`${ctrlBtn} text-xs font-extrabold ${is3D ? "!bg-[#6F2DBD] !text-white" : ""}`}
        >
          3D
        </button>

        <button
          type="button"
          onClick={locate}
          aria-label="Show hotels near me"
          className={ctrlBtn}
        >
          {locating ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3.2" />
              <path d="M12 2.5v3.3M12 18.2v3.3M2.5 12h3.3M18.2 12h3.3" />
              <circle cx="12" cy="12" r="7.5" />
            </svg>
          )}
        </button>

        {Math.abs(bearing) > 1 && (
          <button
            type="button"
            onClick={() => map()?.easeTo({ bearing: 0, duration: 400 })}
            aria-label="Reset map to north"
            className={ctrlBtn}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              style={{ transform: `rotate(${-bearing}deg)` }}
              aria-hidden="true"
            >
              <path d="M12 3l4 9H8z" fill="#E5484D" />
              <path d="M12 21l-4-9h8z" fill="#9A93A8" />
            </svg>
          </button>
        )}
      </div>

      {toast && (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-6 top-[112px] z-10 mx-auto w-fit max-w-[75%] rounded-full bg-[#2A1240] px-4 py-2 text-center text-sm font-semibold text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
