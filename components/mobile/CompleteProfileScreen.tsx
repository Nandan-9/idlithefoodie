"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/app/providers";
import { API_BASE, isApiConfigured } from "@/lib/config";
import { OtpError, sendUserSignupOtp, verifyUserSignupOtp } from "@/lib/api";

const PHONE_RE = /^\+91[6-9]\d{9}$/;
const RESEND_COOLDOWN_SECONDS = 30;

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

  const [stage, setStage] = useState<"details" | "otp">("details");
  const [code, setCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const resendTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace("/login?error=incomplete_profile");
    }
  }, [token, router]);

  useEffect(() => {
    return () => {
      if (resendTimer.current) clearInterval(resendTimer.current);
    };
  }, []);

  function startResendTimer() {
    if (resendTimer.current) clearInterval(resendTimer.current);
    setResendSecondsLeft(RESEND_COOLDOWN_SECONDS);
    resendTimer.current = setInterval(() => {
      setResendSecondsLeft((s) => {
        if (s <= 1 && resendTimer.current) {
          clearInterval(resendTimer.current);
        }
        return s - 1;
      });
    }, 1000);
  }

  const phone = `+91${phone10}`;

  async function handleSubmitDetails(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !token) return;

    setUsernameError(null);
    setPhoneError(null);
    setFormError(null);

    const u = username.trim();
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
      await sendUserSignupOtp(phone);
      setStage("otp");
      setOtpError(null);
      startResendTimer();
    } catch (err) {
      if (err instanceof OtpError && /phone/i.test(err.message)) {
        setPhoneError(err.message);
      } else {
        setFormError(err instanceof Error ? err.message : "Network error. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (submitting || resendSecondsLeft > 0) return;
    setSubmitting(true);
    setOtpError(null);
    try {
      await sendUserSignupOtp(phone);
      startResendTimer();
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Could not resend the code.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleChangeNumber() {
    if (resendTimer.current) clearInterval(resendTimer.current);
    setStage("details");
    setCode("");
    setOtpError(null);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !token) return;

    if (code.length !== 6) {
      setOtpError("Enter the 6-digit code");
      return;
    }

    setSubmitting(true);
    setOtpError(null);
    try {
      const verificationToken = await verifyUserSignupOtp(phone, code);

      const res = await fetch(`${API_BASE}/auth/google/complete/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          username: username.trim(),
          phone,
          verification_token: verificationToken,
        }),
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
        setStage("details");
        return;
      }
      setOtpError(message);
    } catch (err) {
      if (err instanceof OtpError) {
        if (err.status === 410) {
          setOtpError("Code expired, please request a new one.");
        } else if (err.status === 401) {
          setOtpError("Incorrect code.");
        } else if (err.status === 429) {
          setOtpError("Please wait before requesting another code.");
        } else {
          setOtpError(err.message);
        }
      } else {
        setFormError("Network error. Please try again.");
      }
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

  if (stage === "otp") {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF7F2] px-6 pt-16 font-sans">
        <h1 className="text-[#6F2DBD] text-2xl font-extrabold">Verify your number</h1>
        <p className="text-[#888] text-sm mt-1">Enter the OTP sent to {phone}.</p>

        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 mt-8">
          <div>
            <div className="flex items-center gap-3 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-4 shadow-sm">
              <input
                type="text"
                inputMode="numeric"
                placeholder="123456"
                maxLength={6}
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setOtpError(null);
                }}
                className="flex-1 bg-transparent text-[#333] placeholder-[#BBB] text-[20px] tracking-[0.4em] text-center outline-none"
              />
            </div>
            {otpError && <p className="text-red-500 text-xs mt-1 px-1">{otpError}</p>}
          </div>

          {formError && (
            <p className="text-red-500 text-sm text-center">{formError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#6F2DBD] text-white font-bold text-base rounded-2xl py-4 mt-2 shadow-md active:scale-95 transition-transform disabled:opacity-60"
          >
            {submitting ? "Verifying…" : "Verify & continue"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleChangeNumber}
              disabled={submitting}
              className="text-[#6F2DBD] font-semibold disabled:opacity-60"
            >
              Change phone number
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={submitting || resendSecondsLeft > 0}
              className="text-[#6F2DBD] font-semibold disabled:opacity-60"
            >
              {resendSecondsLeft > 0 ? `Resend in ${resendSecondsLeft}s` : "Resend OTP"}
            </button>
          </div>
        </form>
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

      <form onSubmit={handleSubmitDetails} className="flex flex-col gap-4 mt-8">
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
          {submitting ? "Sending OTP…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
