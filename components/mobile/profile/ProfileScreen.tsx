"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useMyPosts } from "@/hooks/useMyPosts";
import { instantEnabled } from "@/lib/config";
import AppShell from "@/components/mobile/AppShell";
import ProfileHeader from "./ProfileHeader";
import ProfileCompletion from "./ProfileCompletion";
import ArchivesRow from "./ArchivesRow";
import MyPostsGrid from "./MyPostsGrid";
import ProfileSettingsDrawer from "./ProfileSettingsDrawer";

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, loading, error, refresh } = useProfile();
  const {
    posts,
    loading: postsLoading,
    error: postsError,
    refresh: refreshPosts,
    setPosts,
  } = useMyPosts();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const refreshAll = () => {
    refresh();
    refreshPosts();
  };

  return (
    <AppShell active="profile">
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
          <ProfileHeader
            profile={profile}
            onOpenSettings={() => setSettingsOpen(true)}
            onRefresh={refreshAll}
            refreshing={loading || postsLoading}
          />

          {!profile.is_profile_complete && (
            <div className="mx-4 mt-5">
              <ProfileCompletion
                percentage={profile.completion_percentage}
                incompleteFields={profile.incomplete_fields}
              />
            </div>
          )}

          {instantEnabled && (
            <div className="mx-4 mt-5">
              <ArchivesRow
                archives={profile.archives ?? []}
                onNew={() => router.push("/archives/new")}
                onOpen={(a) =>
                  router.push(
                    `/archives/${a.id}?name=${encodeURIComponent(
                      a.name
                    )}&emoji=${encodeURIComponent(a.emoji)}`
                  )
                }
              />
            </div>
          )}

          <div className="mt-3">
            <MyPostsGrid
              posts={posts}
              loading={postsLoading}
              error={postsError}
              refresh={refreshPosts}
              setPosts={setPosts}
            />
          </div>
        </div>
      )}

      <ProfileSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </AppShell>
  );
}
