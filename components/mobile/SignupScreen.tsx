"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/providers";
import {
  OtpError,
  sendUserAuthOtp,
  signupRequest,
  verifyUserAuthOtp,
} from "@/lib/api";

const PHONE_RE = /^[6-9]\d{9}$/;
const RESEND_COOLDOWN_SECONDS = 30;

type Stage = "phone" | "otp" | "username" | "password";

const SUBTITLES: Record<Stage, string> = {
  phone: "Enter your number and we'll send you a verification code",
  otp: "Enter the 6-digit code we sent you",
  username: "Pick a username — this is how others will find you",
  password: "Create a password (at least 8 characters)",
};

const INPUT_CLASS =
  "w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3.5 text-base text-[#1A1A1A] outline-none focus:border-[#6F2DBD]";

export default function SignupScreen() {
  const router = useRouter();
  const { status, refetch } = useSession();

  const [stage, setStage] = useState<Stage>("phone");
  const [phone10, setPhone10] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const resendTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const phone = `+91${phone10}`;

  useEffect(() => {
    if (status === "authenticated") router.replace("/feed");
  }, [status, router]);

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
        if (s <= 1 && resendTimer.current) clearInterval(resendTimer.current);
        return s - 1;
      });
    }, 1000);
  }

  async function sendOtp() {
    setSubmitting(true);
    setError(null);
    try {
      await sendUserAuthOtp(phone);
      setStage("otp");
      startResendTimer();
    } catch (err) {
      setError(
        err instanceof OtpError && err.status === 429
          ? "Please wait before requesting another code"
          : err instanceof Error
            ? err.message
            : "Could not send OTP"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handlePhone(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!phone10) {
      setError("Please enter your phone number");
      return;
    }
    if (!PHONE_RE.test(phone10)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    sendOtp();
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (code.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await verifyUserAuthOtp(phone, code);
      if (result.isNewUser) {
        if (resendTimer.current) clearInterval(resendTimer.current);
        setVerificationToken(result.verificationToken ?? "");
        setStage("username");
      } else {
        await refetch();
        router.replace("/feed");
      }
    } catch (err) {
      if (err instanceof OtpError) {
        setError(
          err.status === 409
            ? "User already exists, please log in"
            : err.status === 410
              ? "Code expired, please request a new one"
              : err.status === 401
                ? "Incorrect code"
                : err.status === 429
                  ? "Please wait before requesting another code"
                  : err.message
        );
      } else {
        setError(err instanceof Error ? err.message : "Verification failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleUsername(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    setError(null);
    setStage("password");
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (password.length < 8) {
      setError(
        password ? "Password must be at least 8 characters" : "Password is required"
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await signupRequest(username.trim(), phone, password, verificationToken);
      await refetch();
      router.replace("/feed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
      if (message.includes("username already taken")) {
        setError("That username is already taken");
        setStage("username");
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function changePhone() {
    if (resendTimer.current) clearInterval(resendTimer.current);
    setResendSecondsLeft(0);
    setCode("");
    setError(null);
    setStage("phone");
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-[#FAF7F2] font-sans">
      <div className="flex justify-center pt-12 pb-6">
        <Image
          src="/assets/idli-new-Photoroom.png"
          alt="Idlie"
          width={180}
          height={80}
          priority
          className="object-contain"
        />
      </div>

      <div className="flex items-center justify-between px-7 mb-2">
        <div>
          <p className="text-[#6F2DBD] font-extrabold text-2xl leading-tight">
            Become a
          </p>
          <p className="text-[#1A1A1A] font-extrabold text-2xl leading-tight">
            Foodie!
          </p>
          <p className="text-[#888] text-sm mt-1">{SUBTITLES[stage]}</p>
        </div>
        <Image
          src="/assets/mascote.png"
          alt="Idlie Mascot"
          width={100}
          height={100}
          className="object-contain"
        />
      </div>

      <div className="px-6 mt-10">
        {stage === "phone" && (
          <form onSubmit={handlePhone} className="flex flex-col gap-4">
            <div className="flex items-center rounded-2xl border border-[#E0E0E0] bg-white focus-within:border-[#6F2DBD]">
              <span className="pl-4 text-base font-semibold text-[#1A1A1A]">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone10}
                onChange={(e) => {
                  setPhone10(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setError(null);
                }}
                placeholder="Mobile number"
                autoComplete="tel-national"
                disabled={submitting}
                className="w-full bg-transparent px-3 py-3.5 text-base text-[#1A1A1A] outline-none"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-[#6F2DBD] py-3.5 text-base font-bold text-white disabled:opacity-60"
            >
              {submitting ? "Sending OTP…" : "Send OTP"}
            </button>
          </form>
        )}

        {stage === "otp" && (
          <form onSubmit={handleOtp} className="flex flex-col gap-4">
            <p className="text-[#888] text-sm text-center">
              Code sent to {phone}
            </p>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError(null);
              }}
              placeholder="6-digit code"
              autoComplete="one-time-code"
              disabled={submitting}
              className={`${INPUT_CLASS} text-center tracking-[0.5em]`}
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-[#6F2DBD] py-3.5 text-base font-bold text-white disabled:opacity-60"
            >
              {submitting ? "Verifying…" : "Verify & continue"}
            </button>
            <button
              type="button"
              onClick={sendOtp}
              disabled={resendSecondsLeft > 0 || submitting}
              className="text-sm font-semibold text-[#6F2DBD] disabled:text-[#888]"
            >
              {resendSecondsLeft > 0
                ? `Resend OTP in ${resendSecondsLeft}s`
                : "Resend OTP"}
            </button>
            <button
              type="button"
              onClick={changePhone}
              disabled={submitting}
              className="text-sm font-semibold text-[#6F2DBD]"
            >
              Change phone number
            </button>
          </form>
        )}

        {stage === "username" && (
          <form onSubmit={handleUsername} className="flex flex-col gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(
                  e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20)
                );
                setError(null);
              }}
              placeholder="Username (e.g. foodie_anu)"
              autoComplete="username"
              className={INPUT_CLASS}
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-2xl bg-[#6F2DBD] py-3.5 text-base font-bold text-white"
            >
              Continue
            </button>
          </form>
        )}

        {stage === "password" && (
          <form onSubmit={handlePassword} className="flex flex-col gap-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                disabled={submitting}
                className={`${INPUT_CLASS} pr-16`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6F2DBD]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-[#6F2DBD] py-3.5 text-base font-bold text-white disabled:opacity-60"
            >
              {submitting ? "Creating account…" : "Create Account"}
            </button>
          </form>
        )}
      </div>

      <div className="flex-1" />
      <div
        className="relative rounded-t-[40px] flex items-center justify-center py-7"
        style={{ backgroundColor: "#6F2DBD" }}
      >
        <p className="text-white text-sm">
          Already a foodie?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-[#F5D90A] font-bold"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
