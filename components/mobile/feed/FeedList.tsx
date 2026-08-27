"use client";

import type { Post } from "@/types/feed";
import { useState } from "react";
import PostCard from "./PostCard";
import CommentsSheet from "./CommentsSheet";
import { toGoogleMapsUrl } from "@/lib/geo";
import { usePostActions } from "@/hooks/usePostActions";

type Props = {
  posts: Post[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  setPosts: (updater: (prev: Post[]) => Post[]) => void;
};

export default function FeedList({
  posts,
  loading,
  error,
  onRefresh,
  setPosts,
}: Props) {
  const [openCommentPostId, setOpenCommentPostId] = useState<number | null>(null);
  const { toggleLike, toggleSave } = usePostActions();

  if (loading && posts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div
            className="absolute inset-0 border-[#6F2DBD] border-t-transparent rounded-full animate-spin"
            style={{ borderWidth: 3 }}
          />
          <span className="text-xl">🍜</span>
        </div>
        <p className="text-[#888] text-sm">Loading food near you…</p>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-[#E84855] font-semibold">{error}</p>
        <button
          onClick={onRefresh}
          className="bg-[#6F2DBD] text-white font-bold px-6 py-3 rounded-2xl active:scale-95 transition-transform"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center">
        <span className="text-4xl">🍽️</span>
        <p className="text-[#1A1A1A] font-bold text-lg">No posts nearby</p>
        <p className="text-[#888] text-sm">
          Expand your radius or be the first to post!
        </p>
        <button
          onClick={onRefresh}
          className="text-[#6F2DBD] font-semibold text-sm"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-8" style={{ WebkitOverflowScrolling: "touch" }}>
        {/* Refresh button */}
        <div className="flex justify-center py-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-[#6F2DBD] text-xs font-semibold flex items-center gap-1.5 rounded-full bg-[#F0EAFB] px-4 py-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {loading ? "Refreshing…" : "Refresh feed"}
          </button>
        </div>

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => toggleLike(post)}
            onComment={() => setOpenCommentPostId(post.id)}
            onSave={() => toggleSave(post)}
            onMap={() => {
              if (post.location) {
                window.open(
                  toGoogleMapsUrl(post.location, post.title),
                  "_blank",
                  "noopener,noreferrer"
                );
              } else if (process.env.NODE_ENV !== "production") {
                console.warn("[feed] no location url on post", post.id);
              }
            }}
          />
        ))}
      </div>

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
    </>
  );
}
