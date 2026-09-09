"use client";

import type { Post } from "@/types/feed";
import { useEffect, useState } from "react";
import PostCard from "./PostCard";
import CommentsSheet from "./CommentsSheet";
import EditPostDialog from "./EditPostDialog";
import ConfirmDialog from "@/components/mobile/profile/ConfirmDialog";
import { usePostActions } from "@/hooks/usePostActions";

type Props = {
  posts: Post[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  setPosts: (updater: (prev: Post[]) => Post[]) => void;
  /** When set, scroll this post into view on mount (e.g. opened from a grid). */
  initialPostId?: number;
};

export default function FeedList({
  posts,
  loading,
  error,
  onRefresh,
  setPosts,
  initialPostId,
}: Props) {
  const [openCommentPostId, setOpenCommentPostId] = useState<number | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const { toggleLike, toggleSave, deleteRating, editPost, removePost } = usePostActions();

  useEffect(() => {
    if (initialPostId == null) return;
    document
      .getElementById(`post-${initialPostId}`)
      ?.scrollIntoView({ block: "start" });
    // Only run once for the id the viewer was opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editingPost = editingPostId != null ? posts.find((p) => p.id === editingPostId) : undefined;
  const deletingPost = deletingPostId != null ? posts.find((p) => p.id === deletingPostId) : undefined;

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
        {/* Icon-only refresh affordance */}
        <div className="sticky top-0 z-10 flex justify-end px-3 pt-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh feed"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0EAFB] text-[#6F2DBD] shadow-sm active:scale-90 transition-transform disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={loading ? "animate-spin" : ""}>
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>

        {posts.map((post) => (
          <div key={post.id} id={`post-${post.id}`} className="scroll-mt-2">
            <PostCard
              post={post}
              onLike={() => toggleLike(post)}
              onComment={() => setOpenCommentPostId(post.id)}
              onSave={() => toggleSave(post)}
              onDeleteRating={() => deleteRating(post, onRefresh)}
              onEdit={() => setEditingPostId(post.id)}
              onDelete={() => setDeletingPostId(post.id)}
            />
          </div>
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

      {editingPost && (
        <EditPostDialog
          post={editingPost}
          onCancel={() => setEditingPostId(null)}
          onSave={async (description) => {
            await editPost(editingPost, { description }, () => {
              setPosts((ps) =>
                ps.map((p) => (p.id === editingPost.id ? { ...p, description } : p))
              );
              setEditingPostId(null);
            });
          }}
        />
      )}

      {deletingPost && (
        <ConfirmDialog
          title="Delete post?"
          message="This can't be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onCancel={() => setDeletingPostId(null)}
          onConfirm={async () => {
            try {
              await removePost(deletingPost, () => {
                setPosts((ps) => ps.filter((p) => p.id !== deletingPost.id));
              });
            } finally {
              setDeletingPostId(null);
            }
          }}
        />
      )}
    </>
  );
}
