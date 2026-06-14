"use client";

import Image from "next/image";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const trimmed = identifier.trim();
    if (!trimmed || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: trimmed, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.detail ??
          data?.non_field_errors?.[0] ??
          "Login failed. Please check your credentials.";
        setError(msg);
        return;
      }

      // TODO: persist tokens and navigate
      console.log("Login success", data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-[#FAF7F2] font-sans">
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

      {/* Form */}
      <div className="flex flex-col gap-4 px-6 mt-6">
        {/* Username input */}
        <div className="flex items-center gap-3 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-4 shadow-sm">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9B8DC4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <input
            type="text"
            placeholder="Phone number / Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="flex-1 bg-transparent text-[#333] placeholder-[#BBB] text-[15px] outline-none"
          />
        </div>

        {/* Password input */}
        <div className="flex items-center gap-3 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-4 shadow-sm">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9B8DC4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent text-[#333] placeholder-[#BBB] text-[15px] outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[#9B8DC4]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>
        </div>

        {/* Forgot password */}
        <div className="flex justify-end -mt-1">
          <button className="text-[#6F2DBD] text-sm font-medium">
            Forgot password?
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-sm text-center -mt-1">{error}</p>
        )}

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#6F2DBD] text-white font-bold text-base rounded-2xl py-4 mt-1 shadow-md active:scale-95 transition-transform disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Login"}
        </button>

      </div>

      {/* Purple bottom strip */}
      <div className="flex-1" />
      <div
        className="relative rounded-t-[40px] flex items-center justify-center py-7"
        style={{ backgroundColor: "#6F2DBD" }}
      >
        <p className="text-white text-sm">
          New here? Become a foodie,{" "}
          <button className="text-[#F5D90A] font-bold">Signup</button>
        </p>
      </div>
    </div>
  );
}
