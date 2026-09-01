"use client";

import type { Post } from "@/types/feed";

type Props = {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onMap: () => void;
};

export default function PostActions({
  post,
  onLike,
  onComment,
  onSave,
  onMap,
}: Props) {
  return (
    <div className="flex items-center gap-4 px-1 py-2">
      {/* Like */}
      <button
        onClick={onLike}
        className="flex items-center gap-1.5 active:scale-90 transition-transform"
        aria-label={post.is_liked ? "Unlike" : "Like"}
      >
        <HeartIcon filled={post.is_liked} />
        <span className="text-[#555] text-xs font-medium">{post.like_count}</span>
      </button>

      {/* Comment */}
      <button
        onClick={onComment}
        className="flex items-center gap-1.5 active:scale-90 transition-transform"
        aria-label="Comments"
      >
        <CommentIcon />
        <span className="text-[#555] text-xs font-medium">{post.comment_count}</span>
      </button>

      {/* Map / Location */}
      {post.location_link && (
        <button
          onClick={onMap}
          className="flex items-center gap-1.5 active:scale-90 transition-transform"
          aria-label="Open location in Google Maps"
        >
          <LocationIcon />
        </button>
      )}

      {/* Save — pushed to right */}
      <button
        onClick={onSave}
        className="ml-auto active:scale-90 transition-transform"
        aria-label={post.is_saved ? "Unsave" : "Save"}
      >
        <BookmarkIcon filled={post.is_saved} />
      </button>
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "#6F2DBD" : "none"} stroke={filled ? "#6F2DBD" : "#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "#F5D90A" : "none"} stroke={filled ? "#F5D90A" : "#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
