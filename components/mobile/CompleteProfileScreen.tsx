"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/app/providers";
import { API_BASE, isApiConfigured } from "@/lib/config";

const PHONE_RE = /^\+91[6-9]\d{9}$/;

/** Best-effort, display-only decode of the Google registration JWT payload. */
function peekToken(token: string): { name?: string; picture?: string; email?: string } {
  try {
    const part = token.split(".")[1];
    if (!part) return {};
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, "="));
    return JSON.parse(json);
  } catch {
    return {};
  }
}

/**
 * Landing spot for new Google users: `/complete-profile?token=<registration JWT>`.
 * Collects a username and an Indian phone number, exchanges them (with the token)
 * for a real session via `POST /auth/google/complete/`. The session rides on the
 * HttpOnly cookies the backend sets on that response — we ignore `data.tokens`.
 */
export default function CompleteProfileScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { refetch } = useSession();

  const token = params.get("token");
  const [claims] = useState(() => (token ? peekToken(token) : {}));

  const [username, setUsername] = useState(() =>
    (claims.name ?? claims.email?.split("@")[0] ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20),
  );
  const [phone10, setPhone10] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/login?error=incomplete_profile");
    }
  }, [token, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !token) return;

    setUsernameError(null);
    setPhoneError(null);
    setFormError(null);

    const u = username.trim();
    const phone = `+91${phone10}`;
    if (!u) {
      setUsernameError("Please choose a username.");
      return;
    }
    if (!PHONE_RE.test(phone)) {
      setPhoneError("Enter a 10-digit Indian mobile number.");
      return;
    }

    if (!isApiConfigured) {
      setFormError(
        "Sign-in is temporarily unavailable (API endpoint is not configured). " +
          "Please try again later.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/google/complete/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, username: u, phone }),
      });
      const body = await res.json().catch(() => null);

      if (res.ok) {
        await refetch();
        router.replace("/feed");
        return;
      }

      const message: string = body?.message ?? "Could not finish signing in.";
      const hint = body?.data;

      if (res.status === 401) {
        setFormError("Your signup session expired. Please sign in again.");
        setTimeout(() => router.replace("/login"), 1500);
        return;
      }
      if (hint === "login") {
        setFormError("You already have an account. Redirecting you to login…");
        setTimeout(() => router.replace("/login"), 1500);
        return;
      }
      if (/username/i.test(message)) {
        setUsernameError(message);
        return;
      }
      if (/phone/i.test(message)) {
        setPhoneError(message);
        return;
      }
      setFormError(message);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2] px-6 pt-16 font-sans">
      <h1 className="text-[#6F2DBD] text-2xl font-extrabold">Almost there!</h1>
      <p className="text-[#888] text-sm mt-1">
        {claims.name ? `Hi ${claims.name}. ` : ""}Pick a username and add your
        phone number to finish setting up your account.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
        <div>
          <div className="flex items-center gap-3 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-4 shadow-sm">
            <span className="text-[#9B8DC4] text-[15px]">@</span>
            <input
              type="text"
              placeholder="username"
              autoCapitalize="none"
              autoCorrect="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 bg-transparent text-[#333] placeholder-[#BBB] text-[15px] outline-none"
            />
          </div>
          {usernameError && (
            <p className="text-red-500 text-xs mt-1 px-1">{usernameError}</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-4 shadow-sm">
            <span className="text-[#333] text-[15px]">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="9812345678"
              maxLength={10}
              value={phone10}
              onChange={(e) =>
                setPhone10(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className="flex-1 bg-transparent text-[#333] placeholder-[#BBB] text-[15px] outline-none"
            />
          </div>
          {phoneError && (
            <p className="text-red-500 text-xs mt-1 px-1">{phoneError}</p>
          )}
        </div>

        {formError && (
          <p className="text-red-500 text-sm text-center">{formError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#6F2DBD] text-white font-bold text-base rounded-2xl py-4 mt-2 shadow-md active:scale-95 transition-transform disabled:opacity-60"
        >
          {submitting ? "Finishing up…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
