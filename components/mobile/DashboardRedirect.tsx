"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/app/providers";

/**
 * Landing spot for returning Google users:
 * `/dashboard?access=<jwt>&refresh=<jwt>`. Persists the tokens, scrubs them from
 * the URL, and sends the user into the app.
 */
export default function DashboardRedirect() {
  const router = useRouter();
  const params = useSearchParams();
  const { status, login } = useSession();

  useEffect(() => {
    const access = params.get("access");
    const refresh = params.get("refresh");

    if (access && refresh) {
      login(access, refresh);
      window.history.replaceState({}, "", "/dashboard");
      router.replace("/feed");
      return;
    }

    if (status === "authenticated") router.replace("/feed");
    else if (status === "unauthenticated") router.replace("/login");
  }, [params, status, login, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
    </div>
  );
}
