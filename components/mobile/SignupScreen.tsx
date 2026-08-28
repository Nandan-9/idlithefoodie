"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/providers";
import GoogleButton from "@/components/mobile/GoogleButton";

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";

export default function SignupScreen() {
  const router = useRouter();
  const { status, login } = useSession();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/feed");
  }, [status, router]);

  async function handleSignup() {
    const u = username.trim();
    const p = phone.trim();
    if (!u || !p || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, phone: p, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.detail ??
          data?.non_field_errors?.[0] ??
          Object.values(data ?? {})?.[0]?.toString() ??
          "Signup failed. Please try again.";
        setError(msg);
        return;
      }

      const token = data.tokens?.access ?? data.access ?? data.token ?? "";
      const refresh = data.tokens?.refresh ?? data.refresh ?? null;
      if (token) {
        login(token, refresh);
        router.push("/feed");
      } else {
        // No auto-login token returned — send them to login.
        router.push("/login");
      }
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
            Become a
          </p>
          <p className="text-[#1A1A1A] font-extrabold text-2xl leading-tight">
            Foodie!
          </p>
          <p className="text-[#888] text-sm mt-1">
            Create an account to start your foodie journey
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
        <div className="flex items-center gap-3 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-4 shadow-sm">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 bg-transparent text-[#333] placeholder-[#BBB] text-[15px] outline-none"
          />
        </div>

        <div className="flex items-center gap-3 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-4 shadow-sm">
          <input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 bg-transparent text-[#333] placeholder-[#BBB] text-[15px] outline-none"
          />
        </div>

        <div className="flex items-center gap-3 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-4 shadow-sm">
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
            className="text-[#9B8DC4] text-sm font-medium"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center -mt-1">{error}</p>
        )}

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-[#6F2DBD] text-white font-bold text-base rounded-2xl py-4 mt-1 shadow-md active:scale-95 transition-transform disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>

        <GoogleButton />
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
