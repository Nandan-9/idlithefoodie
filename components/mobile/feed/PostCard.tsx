"use client";

import { useState } from "react";
import type { Post } from "@/types/feed";
import PostHeader from "./PostHeader";
import PostMedia from "./PostMedia";
import PostMeta from "./PostMeta";
import PostActions from "./PostActions";
import PostRating from "./PostRating";

type Props = {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onMap: () => void;
  onDeleteRating: () => void;
};

export default function PostCard({
  post,
  onLike,
  onComment,
  onSave,
  onMap,
  onDeleteRating,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-4 mx-3">
      {/* Media with overlaid header and location */}
      <div className="relative" style={{ aspectRatio: "4/5" }}>
        <PostMedia post={post} />

        {/* Gradient overlay at top for header readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30 pointer-events-none" />

        {/* Header on top of media */}
        <div className="absolute top-0 left-0 right-0">
          <PostHeader post={post} onDeleteRating={onDeleteRating} />
        </div>
      </div>

      {/* Below-media content */}
      <div className="px-3 pb-3">
        <PostActions
          post={post}
          onLike={onLike}
          onComment={onComment}
          onSave={onSave}
          onMap={onMap}
        />
        <PostMeta
          post={post}
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
        />
        {expanded && <PostRating post={post} />}
      </div>
    </div>
  );
}
