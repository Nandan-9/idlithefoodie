"use client";

import { useMemo, useState } from "react";
import { useExplorePosts } from "@/hooks/useExplorePosts";
import { usePostActions } from "@/hooks/usePostActions";
import { toGoogleMapsUrl } from "@/lib/geo";
import AppShell from "@/components/mobile/AppShell";
import PostCard from "@/components/mobile/feed/PostCard";
import CommentsSheet from "@/components/mobile/feed/CommentsSheet";

export default function ExploreScreen() {
  const [query, setQuery] = useState("");
  const { posts, loading, error, refresh, setPosts } = useExplorePosts(query);
  const { toggleLike, toggleSave, rate, deleteRating } = usePostActions();

  const [openPostId, setOpenPostId] = useState<number | null>(null);
  const [openCommentPostId, setOpenCommentPostId] = useState<number | null>(null);

  // One seamless grid, highest-rated first (ties keep the backend's order).
  const ranked = useMemo(
    () => [...posts].sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0)),
    [posts]
  );

  const openPost = openPostId != null ? posts.find((p) => p.id === openPostId) : undefined;

  return (
    <AppShell active="explore">
      <header className="relative overflow-hidden rounded-b-[28px] bg-linear-to-br from-[#6F2DBD] to-[#A85CF0] px-5 pb-6 pt-5 text-white">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-white/10" />
        <p className="relative text-xs font-semibold uppercase tracking-wider text-white/70">
          Find your next bite
        </p>
        <h1 className="relative mt-1 text-[26px] font-extrabold leading-tight">
          Explore dishes 🍽️
        </h1>

        <div className="relative mt-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg shadow-black/10 ring-2 ring-transparent transition focus-within:ring-[#F5C518]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6F2DBD"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search a dish or a place"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[15px] text-[#333] placeholder-[#BBB] outline-none"
          />
        </div>
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
            onClick={refresh}
            className="rounded-2xl bg-[#6F2DBD] text-white font-bold text-sm px-6 py-3 active:scale-95 transition-transform"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <span className="text-4xl">🔍</span>
          <p className="text-[#1A1A1A] font-bold text-lg">Nothing found</p>
          <p className="text-[#888] text-sm">
            {query.trim() ? "Try a different dish or place." : "No posts to explore yet."}
          </p>
        </div>
      )}

      {ranked.length > 0 && (
        <div className="grid grid-cols-3 gap-1 p-1 pb-24 lg:pb-8">
          {ranked.map((p) => (
            <button
              key={p.id}
              onClick={() => setOpenPostId(p.id)}
              className="relative aspect-square overflow-hidden bg-[#E5E0F5] active:scale-[0.98] transition-transform"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.thumbnail_url}
                alt={p.title}
                className="h-full w-full object-cover"
              />
              {p.media_type === "video" && (
                <span className="absolute top-1.5 right-1.5 text-white drop-shadow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {openPost && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#F0EAFB]">
          <div className="flex items-center gap-2 px-3 py-3">
            <button
              onClick={() => setOpenPostId(null)}
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm active:scale-90 transition-transform"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pb-8" style={{ WebkitOverflowScrolling: "touch" }}>
            <PostCard
              post={openPost}
              onLike={() => toggleLike(openPost)}
              onComment={() => setOpenCommentPostId(openPost.id)}
              onSave={() => toggleSave(openPost)}
              onRate={(stars) => rate(openPost, stars)}
              onDeleteRating={() => deleteRating(openPost)}
              onMap={() => {
                if (openPost.location_link) {
                  window.open(
                    toGoogleMapsUrl(openPost.location_link, openPost.title),
                    "_blank",
                    "noopener,noreferrer"
                  );
                }
              }}
            />
          </div>
        </div>
      )}

      {openCommentPostId !== null && (
        <CommentsSheet
          postId={openCommentPostId}
          onClose={() => setOpenCommentPostId(null)}
          onCommentCountChange={(delta) =>
            setPosts((ps) =>
              ps.map((p) =>
                p.id === openCommentPostId
                  ? { ...p, comment_count: Math.max(0, p.comment_count + delta) }
                  : p
              )
            )
          }
        />
      )}
    </AppShell>
  );
}
