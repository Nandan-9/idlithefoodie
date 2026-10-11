import type { ReactNode } from "react";
import { preconnect } from "react-dom";
import AuthGate from "@/components/AuthGate";
import MapWarmup from "@/components/mobile/hotels/MapWarmup";
import { TILE_ORIGIN } from "@/lib/mapConfig";

export default function HotelsLayout({ children }: { children: ReactNode }) {
  // Open the connection to the tile server before the map asks for anything.
  preconnect(TILE_ORIGIN, { crossOrigin: "anonymous" });
  return (
    <>
      <MapWarmup />
      <AuthGate>{children}</AuthGate>
    </>
  );
}
