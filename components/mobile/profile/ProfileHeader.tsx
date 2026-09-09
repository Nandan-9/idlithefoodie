"use client";

import Image from "next/image";
import type { Profile } from "@/types/profile";

type Props = {
  profile: Profile;
  onOpenSettings: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export default function ProfileHeader({
  profile,
  onOpenSettings,
  onRefresh,
  refreshing,
}: Props) {
  const displayName = profile.name || profile.username;

  return (
    <div className="relative overflow-x-clip bg-white px-4 pt-4 pb-4">
      {/* decorative blob bleeding off the top-right */}
      <div className="pointer-events-none absolute -top-3 -right-10 -z-0 h-40 w-40 rounded-full bg-[#6F2DBD]/10" />

      <div className="relative z-10">
        {/* Row 1: wordmark + actions */}
        <div className="flex items-center">
          <Image
            src="/asset2/idli-icon.png"
            alt="idli"
            width={90}
            height={34}
            unoptimized
            className="h-[34px] w-auto object-contain"
            priority
          />
          <div className="ml-auto flex items-center gap-1">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                aria-label="Refresh"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#1A1A1A] active:scale-90 transition-transform disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? "animate-spin" : ""}>
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </button>
            )}
            <button
              onClick={onOpenSettings}
              aria-label="Settings"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#1A1A1A] active:scale-90 transition-transform"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Row 2: avatar + identity + mascot */}
        <div className="mt-4 flex items-start gap-3.5">
          <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-[#6F2DBD] bg-[#E5E0F5] shadow-[0_3px_10px_rgba(111,45,189,0.35)]">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={displayName}
                width={72}
                height={72}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#9B8DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-start">
            <div className="flex max-w-full items-center gap-1.5">
              <h1 className="truncate text-lg font-bold text-[#1A1A1A]">
                {displayName}
              </h1>
              {profile.is_verified && (
                <svg className="flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="#6F2DBD" stroke="none">
                  <path d="M12 1l2.5 2.5L18 3l.5 3.5L22 8l-1.8 3L22 14l-3.5 1.5L18 19l-3.5-.5L12 21l-2.5-2.5L6 19l-.5-3.5L2 14l1.8-3L2 8l3.5-1.5L6 3l3.5.5z" />
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <p className="text-xs font-medium text-[#6F2DBD]">
              @{profile.username}
            </p>
            {profile.bio && (
              <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed text-[#1A1A1A]/75">
                {profile.bio}
              </p>
            )}
          </div>

          <Image
            src="/asset2/idli-mascot.png"
            alt=""
            width={96}
            height={96}
            unoptimized
            className="w-24 flex-shrink-0 self-end object-contain"
          />
        </div>
      </div>
    </div>
  );
}
