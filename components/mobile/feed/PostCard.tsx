"use client";

import { useState } from "react";
import type { Post } from "@/types/feed";
import PostHeader from "./PostHeader";
import PostMedia from "./PostMedia";
import PostMeta from "./PostMeta";
import PostActions from "./PostActions";
import PostRating from "./PostRating";
import PostHotelCard from "./PostHotelCard";

type Props = {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onDeleteRating: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function PostCard({
  post,
  onLike,
  onComment,
  onSave,
  onDeleteRating,
  onEdit,
  onDelete,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-4 mx-3">
      <PostHeader
        post={post}
        onDeleteRating={onDeleteRating}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Media with overlaid hotel card */}
      <div className="relative" style={{ aspectRatio: "4/5" }}>
        <PostMedia post={post} />
        <PostHotelCard post={post} />
      </div>

      {/* Below-media content */}
      <div className="px-3 pb-3">
        <PostActions
          post={post}
          onLike={onLike}
          onComment={onComment}
          onSave={onSave}
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
