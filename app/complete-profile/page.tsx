import { Suspense } from "react";
import CompleteProfileScreen from "@/components/mobile/CompleteProfileScreen";

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<Splash />}>
      <CompleteProfileScreen />
    </Suspense>
  );
}
