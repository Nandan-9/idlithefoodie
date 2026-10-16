"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/providers";
import { OtpError, loginRequest } from "@/lib/api";

export default function LoginScreen() {
  const router = useRouter();
  const { status, refetch } = useSession();

  useEffect(() => {
    if (status === "authenticated") router.replace("/feed");
  }, [status, router]);

  // TODO: temporarily disabled — non-mobile users are no longer blocked
  const showDesktopNudge = false;
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!identifier.trim()) {
      setError("Please enter your phone number or username");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await loginRequest(identifier.trim(), password);
      await refetch();
      router.replace("/feed");
    } catch (err) {
      setError(
        err instanceof OtpError && err.status === 401
          ? "Incorrect username/phone or password"
          : err instanceof Error
            ? err.message
            : "Login failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-[#FAF7F2] font-sans">
      {showDesktopNudge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex justify-center">
              <Image
                src="/assets/mascote.png"
                alt="Idlie Mascot"
                width={90}
                height={90}
                className="object-contain"
              />
            </div>
            <p className="text-[#6F2DBD] font-extrabold text-xl leading-tight">
              Whoa there, big screen!
            </p>
            <p className="text-[#555] text-sm mt-3 leading-relaxed">
              Idli was lovingly steamed for pocket-sized screens. On a desktop
              it feels like eating one idli with a fork and knife — technically
              possible, spiritually wrong.
            </p>
            <p className="text-[#555] text-sm mt-2 leading-relaxed">
              Grab your phone, tap your way in, and let the foodie journey
              begin. 🍽️📱
            </p>
          </div>
        </div>
      )}
      {/* Logo */}
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

      {/* Welcome + Mascot row */}
      <div className="flex items-center justify-between px-7 mb-2">
        <div>
          <p className="text-[#6F2DBD] font-extrabold text-2xl leading-tight">
            Welcome back,
          </p>
          <p className="text-[#1A1A1A] font-extrabold text-2xl leading-tight">
            Foodie!
          </p>
          <p className="text-[#888] text-sm mt-1">
            Login to continue your foodie journey
          </p>
        </div>
        <Image
          src="/assets/mascote.png"
          alt="Idlie Mascot"
          width={100}
          height={100}
          className="object-contain"
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 mt-10">
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Phone or Username (e.g. +919876543210)"
          autoComplete="username"
          disabled={submitting}
          className="w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3.5 text-base text-[#1A1A1A] outline-none focus:border-[#6F2DBD]"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            disabled={submitting}
            className="w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3.5 pr-16 text-base text-[#1A1A1A] outline-none focus:border-[#6F2DBD]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6F2DBD]"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => router.push("/forgot-password")}
          className="self-end -mt-2 text-sm font-semibold text-[#6F2DBD]"
        >
          Forgot password?
        </button>
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-[#6F2DBD] py-3.5 text-base font-bold text-white disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Log In"}
        </button>
      </form>

      {/* Purple bottom strip */}
      <div className="flex-1" />
      <div
        className="relative rounded-t-[40px] flex items-center justify-center py-7"
        style={{ backgroundColor: "#6F2DBD" }}
      >
        <p className="text-white text-sm">
          New here? Become a foodie,{" "}
          <button
            onClick={() => router.push("/signup")}
            className="text-[#F5D90A] font-bold"
          >
            Signup
          </button>
        </p>
      </div>
    </div>
  );
}
