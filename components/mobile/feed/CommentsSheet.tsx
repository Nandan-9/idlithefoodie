"use client";

import { useState, useEffect } from "react";
import {
  fetchComments,
  postComment,
  deleteComment,
  fetchProfile,
} from "@/lib/api";
import type { Comment } from "@/types/feed";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";

type Props = {
  postId: number;
  onClose: () => void;
  /** Called with +1 / -1 as comments are added or removed. */
  onCommentCountChange?: (delta: number) => void;
};

export default function CommentsSheet({
  postId,
  onClose,
  onCommentCountChange,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<{ username: string; avatar: string | null }>();

  useEffect(() => {
    let cancelled = false;
    fetchComments(postId)
      .then((data) => { if (!cancelled) setComments(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    fetchProfile()
      .then((p) => {
        if (!cancelled) setMe({ username: p.username, avatar: p.avatar || null });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [postId]);

  async function handleSubmit(content: string) {
    const tempId = `temp-${Date.now()}`;
    const optimistic: Comment = {
      id: tempId,
      username: me?.username ?? "You",
      avatar: me?.avatar ?? null,
      content,
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [optimistic, ...prev]);
    try {
      await postComment(postId, content);
      onCommentCountChange?.(1);
      const fresh = await fetchComments(postId);
      setComments(fresh);
    } catch (err) {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      throw err;
    }
  }

  async function handleDelete(commentId: string) {
    if (commentId.startsWith("temp-")) return;
    const prev = comments;
    setComments((cs) => cs.filter((c) => c.id !== commentId));
    try {
      await deleteComment(postId, commentId);
      onCommentCountChange?.(-1);
    } catch {
      setComments(prev);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl flex flex-col"
        style={{ maxHeight: "70vh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#E5E0F5] rounded-full" />
        </div>

        {/* Title */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-[#E5E0F5]">
          <h3 className="font-bold text-[#1A1A1A] text-base">Comments</h3>
          <button
            onClick={onClose}
            className="text-[#888] text-xl leading-none p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <CommentList
          comments={comments}
          loading={loading}
          currentUsername={me?.username}
          onDelete={handleDelete}
        />
        <CommentInput onSubmit={handleSubmit} />
      </div>
    </>
  );
}
