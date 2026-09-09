import { Suspense } from "react";
import CreateArchiveScreen from "@/components/mobile/archives/CreateArchiveScreen";

export default function NewArchivePage() {
  return (
    <Suspense fallback={null}>
      <CreateArchiveScreen />
    </Suspense>
  );
}
