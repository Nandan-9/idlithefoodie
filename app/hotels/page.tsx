import { Suspense } from "react";
import HotelsListScreen from "@/components/mobile/hotels/HotelsListScreen";

export default function HotelsPage() {
  return (
    <Suspense>
      <HotelsListScreen />
    </Suspense>
  );
}
