"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types/profile";

export default function ProfileHeader({ profile }: { profile: Profile }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-3 border-b border-[#E5E0F5] bg-white px-4 pt-6 pb-5 sm:flex-row sm:items-start sm:gap-6 sm:px-6">
      <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E5E0F5] sm:h-28 sm:w-28">
        {profile.avatar ? (
          <Image
            src={profile.avatar}
            alt={profile.name || profile.username}
            width={112}
            height={112}
            sizes="(max-width: 640px) 96px, 112px"
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <svg
            width="40"
            height="40"
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
        )}
      </div>

      <div className="flex w-full flex-col items-center sm:items-start">
        <div className="flex items-center gap-1.5">
          <h1 className="text-xl font-extrabold text-[#1A1A1A]">
            {profile.name || profile.username}
          </h1>
          {profile.is_verified && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#6F2DBD" stroke="none">
              <path d="M12 1l2.5 2.5L18 3l.5 3.5L22 8l-1.8 3L22 14l-3.5 1.5L18 19l-3.5-.5L12 21l-2.5-2.5L6 19l-.5-3.5L2 14l1.8-3L2 8l3.5-1.5L6 3l3.5.5z" />
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <p className="text-sm text-[#888]">@{profile.username}</p>

        {profile.bio && (
          <p className="mt-2 max-w-prose whitespace-pre-wrap text-center text-sm text-[#555] sm:text-left">
            {profile.bio}
          </p>
        )}

        <button
          onClick={() => router.push("/profile/edit")}
          className="mt-4 w-full max-w-sm rounded-2xl bg-[#6F2DBD] py-3 text-sm font-bold text-white shadow-md transition-transform active:scale-95 sm:w-auto sm:min-w-[220px]"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
