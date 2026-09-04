"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchSavedPosts, unsavePost } from "@/lib/api";
import type { SavedPost } from "@/types/feed";
import AppShell from "@/components/mobile/AppShell";

export default function SavedScreen() {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPosts(await fetchSavedPosts());
    } catch {
      setError("Could not load your saved posts. Tap retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUnsave(id: number) {
    const prev = posts;
    setPosts((ps) => ps.filter((p) => p.id !== id));
    try {
      await unsavePost(id);
    } catch {
      setPosts(prev);
    }
  }

  return (
    <AppShell active="saved">
      <header className="px-4 py-4 border-b border-[#E5E0F5]">
        <h1 className="text-[#1A1A1A] font-extrabold text-lg">Saved</h1>
      </header>

      {loading && posts.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
        </div>
      )}

      {error && posts.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-[#555] text-sm">{error}</p>
          <button
            onClick={load}
            className="rounded-2xl bg-[#6F2DBD] text-white font-bold text-sm px-6 py-3 active:scale-95 transition-transform"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <p className="text-[#1A1A1A] font-bold text-lg">No saved posts yet</p>
          <p className="text-[#888] text-sm">
            Tap the bookmark on a post to save it here.
          </p>
        </div>
      )}

      {posts.length > 0 && (
        <div className="grid grid-cols-3 gap-1 p-1">
          {posts.map((p) => (
            <div key={p.id} className="relative aspect-square bg-[#E5E0F5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.media[0]?.thumbnail_url}
                alt=""
                className="h-full w-full object-cover"
              />
              {p.media[0]?.content_type === "video" && (
                <span className="absolute top-1.5 right-1.5 text-white drop-shadow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              )}
              <button
                onClick={() => handleUnsave(p.id)}
                aria-label="Unsave"
                className="absolute bottom-1.5 right-1.5 active:scale-90 transition-transform"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#F5D90A" stroke="#F5D90A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
