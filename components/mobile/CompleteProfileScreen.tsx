"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/app/providers";

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";

/**
 * Phone + OTP step for brand-new Google users. They arrive as
 * `/complete-profile?token=<registration_token>`; we collect a phone number,
 * trigger the existing OTP endpoint, then finish signup via
 * `/auth/google/complete/`.
 */
export default function CompleteProfileScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useSession();

  const token = params.get("token");

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [digits, setDigits] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/login?error=incomplete_profile");
  }, [token, router]);

  const phone = `+91${digits}`;

  async function sendOtp() {
    if (digits.length !== 10) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/get-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          data?.message ??
            data?.detail ??
            "Could not send the OTP. Please try again.",
        );
        return;
      }
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function completeSignup() {
    if (!otp.trim()) {
      setError("Enter the OTP you received.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/google/complete/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, phone, otp: otp.trim() }),
      });
      const body = await res.json().catch(() => null);
      if (body?.success) {
        login(body.data.tokens.access, body.data.tokens.refresh);
        router.replace("/feed");
        return;
      }
      setError(body?.message ?? "Could not finish signing up. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
            One last
          </p>
          <p className="text-[#1A1A1A] font-extrabold text-2xl leading-tight">
            step!
          </p>
          <p className="text-[#888] text-sm mt-1">
            {step === "phone"
              ? "Add your phone number to finish signing up"
              : `Enter the OTP sent to ${phone}`}
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

      <div className="flex flex-col gap-4 px-6 mt-6">
        {step === "phone" ? (
          <div className="flex items-center gap-2 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-4 shadow-sm">
            <span className="text-[#333] text-[15px] font-medium">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit phone number"
              value={digits}
              onChange={(e) => setDigits(e.target.value.replace(/\D/g, ""))}
              className="flex-1 bg-transparent text-[#333] placeholder-[#BBB] text-[15px] outline-none"
            />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-4 shadow-sm">
              <input
                type="tel"
                inputMode="numeric"
                placeholder="OTP code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="flex-1 bg-transparent text-[#333] placeholder-[#BBB] text-[15px] outline-none tracking-widest"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError(null);
              }}
              className="text-[#6F2DBD] text-sm font-medium self-start"
            >
              Change number
            </button>
          </>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center -mt-1">{error}</p>
        )}

        <button
          onClick={step === "phone" ? sendOtp : completeSignup}
          disabled={loading}
          className="w-full bg-[#6F2DBD] text-white font-bold text-base rounded-2xl py-4 mt-1 shadow-md active:scale-95 transition-transform disabled:opacity-60"
        >
          {loading
            ? "Please wait…"
            : step === "phone"
              ? "Send OTP"
              : "Finish signup"}
        </button>
      </div>

      <div className="flex-1" />
      <div
        className="relative rounded-t-[40px] flex items-center justify-center py-7"
        style={{ backgroundColor: "#6F2DBD" }}
      >
        <p className="text-white text-sm">
          Wrong account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-[#F5D90A] font-bold"
          >
            Back to login
          </button>
        </p>
      </div>
    </div>
  );
}
