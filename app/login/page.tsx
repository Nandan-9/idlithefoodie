import type { Metadata } from "next";
import { Suspense } from "react";
import LoginScreen from "@/components/mobile/LoginScreen";

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
    </div>
  );
}

export const metadata: Metadata = { robots: { index: false } };

export default function LoginPage() {
  return (
    <Suspense fallback={<Splash />}>
      <LoginScreen />
    </Suspense>
  );
}
