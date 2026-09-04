"use client";

import type { Post } from "@/types/feed";

type Props = {
  post: Post;
  expanded: boolean;
  onToggle: () => void;
};

export default function PostMeta({ post, expanded, onToggle }: Props) {
  const tags = extractTags(post.description);

  return (
    <div className="px-1 pt-2 pb-1">
      <div className="flex items-center gap-2 mb-1 min-w-0">
        <button
          type="button"
          onClick={onToggle}
          className="text-left min-w-0 text-[#1A1A1A] font-bold text-[15px] leading-tight wrap-break-word"
        >
          {post.title}
        </button>
        <span className="bg-[#F5D90A] text-[#1A1A1A] font-bold text-xs px-2 py-0.5 rounded-full flex-shrink-0">
          {post.avg_rating.toFixed(1)}
        </span>
      </div>
      <p
        className={`text-[#555] text-xs leading-relaxed ${
          expanded ? "" : "line-clamp-2"
        }`}
      >
        {post.description}
      </p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[#6F2DBD] text-xs bg-[#F0EAFB] px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function extractTags(text: string): string[] {
  return (text.match(/#(\w+)/g) ?? []).map((t) => t.slice(1));
}
