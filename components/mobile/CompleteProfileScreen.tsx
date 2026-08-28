"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/app/providers";

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";

/**
 * Landing spot for new Google users: `/complete-profile?token=<registration_token>`.
 * We no longer collect a phone number — the token is exchanged straight away for
 * a real session and the user is dropped into the feed.
 */
export default function CompleteProfileScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useSession();

  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = params.get("token");
    if (!token) {
      router.replace("/login?error=incomplete_profile");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/google/complete/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const body = await res.json().catch(() => null);
        const tokens = body?.data?.tokens;
        if (body?.success && tokens?.access) {
          login(tokens.access, tokens.refresh ?? null);
          router.replace("/feed");
          return;
        }
        setError(body?.message ?? "Could not finish signing in. Please try again.");
      } catch {
        setError("Network error. Please try again.");
      }
    })();
  }, [params, login, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAF7F2] px-8 text-center font-sans">
      {error ? (
        <>
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={() => router.replace("/login")}
            className="rounded-2xl bg-[#6F2DBD] px-6 py-3 text-sm font-bold text-white"
          >
            Back to login
          </button>
        </>
      ) : (
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
      )}
    </div>
  );
}
