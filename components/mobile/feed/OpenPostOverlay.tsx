"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { usePostActions } from "@/hooks/usePostActions";
import type { Post } from "@/types/feed";
import PostCard from "./PostCard";
import CommentsSheet from "./CommentsSheet";
import EditPostDialog from "./EditPostDialog";
import ConfirmDialog from "@/components/mobile/profile/ConfirmDialog";

type Props = {
  post: Post;
  onClose: () => void;
  /** Updates the caller's post list after an edit, delete or new comment. */
  setPosts: (update: (posts: Post[]) => Post[]) => void;
  refresh: () => void;
};

/**
 * Full-screen view of a single post with its like, comment, save, edit and
 * delete actions. Portalled to <body> so it covers the page from inside
 * drawers and other stacking contexts.
 */
export default function OpenPostOverlay({ post, onClose, setPosts, refresh }: Props) {
  const { toggleLike, toggleSave, deleteRating, editPost, removePost } = usePostActions();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-[#F0EAFB]">
        <div className="flex items-center gap-2 px-3 py-3">
          <button
            onClick={onClose}
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
            post={post}
            onLike={() => toggleLike(post)}
            onComment={() => setCommentsOpen(true)}
            onSave={() => toggleSave(post)}
            onDeleteRating={() => deleteRating(post, refresh)}
            onEdit={() => setEditing(true)}
            onDelete={() => setDeleting(true)}
          />
        </div>
      </div>

      {editing && (
        <EditPostDialog
          post={post}
          onCancel={() => setEditing(false)}
          onSave={async (description) => {
            await editPost(post, { description }, () => {
              setPosts((ps) => ps.map((p) => (p.id === post.id ? { ...p, description } : p)));
              setEditing(false);
            });
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete post?"
          message="This can't be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onCancel={() => setDeleting(false)}
          onConfirm={async () => {
            try {
              await removePost(post, () => {
                setPosts((ps) => ps.filter((p) => p.id !== post.id));
                onClose();
              });
            } finally {
              setDeleting(false);
            }
          }}
        />
      )}

      {commentsOpen && (
        <CommentsSheet
          postId={post.id}
          onClose={() => setCommentsOpen(false)}
          onCommentCountChange={(delta) =>
            setPosts((ps) =>
              ps.map((p) =>
                p.id === post.id
                  ? { ...p, comment_count: Math.max(0, p.comment_count + delta) }
                  : p
              )
            )
          }
        />
      )}
    </>,
    document.body
  );
}
