"use client";

import { useEffect } from "react";
import { DEFAULT_CENTER, DEFAULT_ZOOM, STYLE_URL, TILE_ORIGIN } from "@/lib/mapConfig";

function tileXY(lng: number, lat: number, z: number): [number, number] {
  const n = 2 ** z;
  const rad = (lat * Math.PI) / 180;
  return [
    Math.floor(((lng + 180) / 360) * n),
    Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n),
  ];
}

/**
 * Starts everything the map needs while the session check is still running:
 * the MapLibre chunk, the style, the tile index and the tiles under the
 * opening view. Responses land in the HTTP cache, so when the map is created
 * it finds them instead of walking style → tile index → tiles from scratch.
 */
export default function MapWarmup() {
  useEffect(() => {
    void import("./HotelsMap");

    const run = async () => {
      try {
        await fetch(STYLE_URL);
        const index = await (await fetch(`${TILE_ORIGIN}/planet`)).json();
        const template: string | undefined = index.tiles?.[0];
        if (!template) return;
        const [cx, cy] = tileXY(DEFAULT_CENTER[0], DEFAULT_CENTER[1], DEFAULT_ZOOM);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const url = template
              .replace("{z}", String(DEFAULT_ZOOM))
              .replace("{x}", String(cx + dx))
              .replace("{y}", String(cy + dy));
            void fetch(url).catch(() => {});
          }
        }
      } catch {
        /* warm-up is best effort */
      }
    };
    // Don't compete with the page's own critical requests.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
    idle(() => void run());
  }, []);

  return null;
}
