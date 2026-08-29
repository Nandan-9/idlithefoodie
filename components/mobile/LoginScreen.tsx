"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/app/providers";
import GoogleButton from "@/components/mobile/GoogleButton";

const OAUTH_ERRORS: Record<string, string> = {
  invalid_state: "Something went wrong signing in with Google. Please try again.",
  missing_code: "Something went wrong signing in with Google. Please try again.",
  google_auth_failed:
    "Something went wrong signing in with Google. Please try again.",
  incomplete_profile:
    "Your Google account didn't share an email. Please try a different account.",
};

export default function LoginScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") router.replace("/feed");
  }, [status, router]);

  // TODO: temporarily disabled — non-mobile users are no longer blocked
  const showDesktopNudge = false;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const e = params.get("error");
    if (e) setError(OAUTH_ERRORS[e] ?? `Google sign-in failed: ${e}`);
  }, [params]);

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

      {/* Google sign-in */}
      <div className="flex flex-col gap-4 px-6 mt-10">
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        <GoogleButton label="Continue with Google" onError={setError} />
        <p className="text-[#888] text-xs text-center px-4">
          We use Google to keep your account secure. No passwords to remember.
        </p>
      </div>

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
