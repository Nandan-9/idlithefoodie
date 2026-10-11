"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/providers";

/**
 * Guard for actions that need a signed-in user. Returns `true` when the caller
 * may proceed; otherwise sends the guest to the sign-in screen and returns `false`.
 */
export function useRequireAuth() {
  const { status } = useSession();
  const router = useRouter();

  return useCallback((): boolean => {
    if (status === "authenticated") return true;
    router.push("/login");
    return false;
  }, [status, router]);
}
