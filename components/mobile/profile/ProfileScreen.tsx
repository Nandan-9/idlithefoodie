"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import AppShell from "@/components/mobile/AppShell";
import ProfileHeader from "./ProfileHeader";
import ProfileCompletion from "./ProfileCompletion";
import MyPostsGrid from "./MyPostsGrid";
import ProfileSettingsDrawer from "./ProfileSettingsDrawer";

export default function ProfileScreen() {
  const { profile, loading, error, refresh } = useProfile();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <AppShell active="profile">
      <header className="flex items-center justify-end px-4 py-2 sm:px-6">
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
          className="p-1 text-[#1A1A1A] active:scale-90 transition-transform"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </header>

      {loading && !profile && (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
        </div>
      )}

      {error && !profile && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
          <p className="text-[#555] text-sm text-center">{error}</p>
          <button
            onClick={refresh}
            className="rounded-2xl bg-[#6F2DBD] text-white font-bold text-sm px-6 py-3 active:scale-95 transition-transform"
          >
            Retry
          </button>
        </div>
      )}

      {profile && (
        <div className="flex-1">
          <ProfileHeader profile={profile} />
          {!profile.is_profile_complete && (
            <ProfileCompletion
              percentage={profile.completion_percentage}
              incompleteFields={profile.incomplete_fields}
            />
          )}

          <MyPostsGrid />
        </div>
      )}

      <ProfileSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </AppShell>
  );
}
