import type { LayerSpecification, StyleSpecification } from "maplibre-gl";
import { MAP_FONT } from "@/lib/mapConfig";

/**
 * A soft, low-contrast base map in the spirit of Snap Map: flat pastel parks
 * and water, roads drawn as quiet strokes with no casings, and detail (side
 * streets, buildings, street names) that only arrives as you zoom in. The map
 * stays a calm backdrop so the hotels and their photos carry the screen.
 *
 * OpenFreeMap's Positron style is still what gets fetched (so the warm-up keeps
 * paying off); this only rewrites its layers.
 */

export const MAP = {
  ground: "#F1EFF4",
  park: "#CFEFCF",
  wood: "#D9F2D4",
  water: "#A6DBF7",
  waterText: "#3E86B8",
  road: "#FFFFFF",
  avenue: "#E2D7F7",
  highway: "#CDB8F2",
  building: "#E6E2EC",
  rail: "#DAD5E2",
  label: "#4E465E",
  muted: "#8F879E",
} as const;

const FONT = [MAP_FONT];

const exp = (base: number, ...stops: number[]) => [
  "interpolate",
  ["exponential", base],
  ["zoom"],
  ...stops,
];
const fadeIn = (from: number, to: number, max = 1) => [
  "interpolate",
  ["linear"],
  ["zoom"],
  from,
  0,
  to,
  max,
];

type Patch = {
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
  minzoom?: number;
};

/** Layers dropped from the style outright, so their tiles are never parsed. */
const HIDE: Patch = {};

const softLabel = (color: string, size: unknown, halo = 1.6): Patch => ({
  paint: {
    "text-color": color,
    "text-halo-color": "rgba(255,255,255,0.9)",
    "text-halo-width": halo,
    "text-halo-blur": 0.5,
  },
  layout: { "text-size": size },
});

const PATCHES: Record<string, Patch> = {
  background: { paint: { "background-color": MAP.ground } },
  park: { paint: { "fill-color": MAP.park, "fill-antialias": true } },
  landcover_wood: { paint: { "fill-color": MAP.wood, "fill-opacity": fadeIn(9, 11) } },
  // City blocks read as clutter at a glance; the buildings carry that detail.
  landuse_residential: HIDE,
  water: { paint: { "fill-color": MAP.water } },
  waterway: { paint: { "line-color": MAP.water } },

  // Buildings arrive only at street level, as faint blocks.
  building: {
    minzoom: 15,
    paint: {
      "fill-color": MAP.building,
      "fill-outline-color": "#DCD6E4",
      "fill-opacity": fadeIn(15, 16),
    },
  },

  // Roads: no casings. Side streets are white strokes that fade in near
  // street level; footpaths only show when you're right on top of them.
  highway_path: {
    minzoom: 16,
    paint: {
      "line-color": MAP.road,
      "line-opacity": 0.8,
      "line-width": exp(1.2, 16, 1, 20, 4),
    },
  },
  highway_minor: {
    minzoom: 12,
    paint: {
      "line-color": MAP.road,
      "line-opacity": fadeIn(12, 14),
      "line-width": exp(1.55, 13, 0.8, 16, 4, 20, 18),
    },
  },
  highway_major_casing: HIDE,
  highway_major_inner: {
    paint: { "line-color": MAP.avenue, "line-width": exp(1.3, 10, 1.2, 14, 4, 20, 20) },
  },
  highway_major_subtle: { paint: { "line-color": MAP.avenue, "line-width": 1.2 } },
  highway_motorway_casing: HIDE,
  highway_motorway_bridge_casing: HIDE,
  highway_motorway_inner: { paint: { "line-color": MAP.highway } },
  highway_motorway_subtle: { paint: { "line-color": MAP.highway } },
  highway_motorway_bridge_inner: { paint: { "line-color": MAP.highway } },
  tunnel_motorway_casing: HIDE,
  tunnel_motorway_inner: HIDE,
  road_area_pier: { paint: { "fill-color": MAP.road } },
  road_pier: { paint: { "line-color": MAP.road } },

  railway: { minzoom: 14, paint: { "line-color": MAP.rail } },
  railway_transit: { minzoom: 14, paint: { "line-color": MAP.rail, "line-width": 1.5 } },
  railway_service: HIDE,
  railway_dashline: HIDE,
  railway_transit_dashline: HIDE,
  railway_service_dashline: HIDE,

  "aeroway-area": { paint: { "fill-color": "#E9E5F0" } },
  "aeroway-runway": { paint: { "line-color": MAP.road } },
  "aeroway-runway-casing": HIDE,
  "aeroway-taxiway": { paint: { "line-color": MAP.road } },

  boundary_3: HIDE,
  boundary_disputed: HIDE,
  boundary_2: { paint: { "line-color": MAP.highway } },

  // Labels: few, small, soft grey. Street names wait for street level.
  waterway_line_label: softLabel(MAP.waterText, 11),
  water_name_point_label: softLabel(MAP.waterText, 12),
  water_name_line_label: softLabel(MAP.waterText, 12),
  "highway-name-path": HIDE,
  "highway-name-minor": { minzoom: 16, ...softLabel(MAP.muted, 11, 1.4) },
  "highway-name-major": { minzoom: 14, ...softLabel(MAP.muted, 11.5, 1.6) },
  "highway-shield-non-us": HIDE,
  "highway-shield-us-interstate": HIDE,
  road_shield_us: HIDE,
  airport: softLabel(MAP.muted, 11),
  // Neighbourhoods: small, spaced, quiet, like area names on a game map.
  label_other: {
    minzoom: 12,
    paint: {
      "text-color": MAP.muted,
      "text-halo-color": "rgba(255,255,255,0.9)",
      "text-halo-width": 1.4,
      "text-halo-blur": 0.5,
    },
    layout: {
      "text-size": exp(1.2, 12, 10, 16, 12),
      "text-letter-spacing": 0.08,
      "text-transform": "uppercase",
    },
  },
  label_village: softLabel(MAP.label, exp(1.2, 9, 11, 14, 13)),
  label_town: softLabel(MAP.label, exp(1.2, 7, 12, 12, 15)),
  label_state: softLabel(MAP.muted, 12),
  label_city: softLabel(MAP.label, exp(1.2, 4, 12, 8, 14, 12, 18), 2),
  label_city_capital: softLabel(MAP.label, exp(1.2, 4, 12, 8, 14, 12, 18), 2),
  label_country_1: softLabel(MAP.label, 14, 2),
  label_country_2: softLabel(MAP.label, 13, 2),
  label_country_3: softLabel(MAP.label, 12, 2),
};

/** Drops Positron's icons (town dots, airport glyph); labels stand alone. */
function withoutIcons(layout: Record<string, unknown>) {
  for (const key of Object.keys(layout)) if (key.startsWith("icon-")) delete layout[key];
  return layout;
}

export function softMapStyle(style: StyleSpecification): StyleSpecification {
  const layers: LayerSpecification[] = [];
  for (const layer of style.layers) {
    if (PATCHES[layer.id] === HIDE) continue;
    const patch: Patch = { ...PATCHES[layer.id] };
    if (layer.type === "symbol") {
      // Every label uses one font stack, so only one set of glyphs is fetched.
      patch.layout = { ...patch.layout, "text-font": FONT };
    }
    if (!patch.paint && !patch.layout && patch.minzoom === undefined) {
      layers.push(layer);
      continue;
    }
    const next = {
      ...layer,
      paint: { ...(layer as { paint?: object }).paint, ...patch.paint },
      layout: withoutIcons({ ...(layer as { layout?: object }).layout, ...patch.layout }),
    } as LayerSpecification;
    if (patch.minzoom !== undefined) next.minzoom = patch.minzoom;
    layers.push(next);
  }
  // No layer draws an icon any more, so skip the sprite sheet download.
  const next: StyleSpecification = { ...style, layers };
  delete next.sprite;
  return next;
}
