"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/providers";
import GoogleButton from "@/components/mobile/GoogleButton";

export default function SignupScreen() {
  const router = useRouter();
  const { status } = useSession();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") router.replace("/feed");
  }, [status, router]);

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
            Sign up with Google to start your foodie journey
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

      <div className="flex flex-col gap-4 px-6 mt-10">
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        <GoogleButton label="Sign up with Google" onError={setError} />
        <p className="text-[#888] text-xs text-center px-4">
          You&apos;ll pick a username and add your phone number in the next step.
        </p>
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
