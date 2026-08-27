"use client";

import type { Post } from "@/types/feed";

type Props = { post: Post };

export default function PostMeta({ post }: Props) {
  const tags = extractTags(post.description);

  return (
    <div className="px-1 pt-2 pb-1">
      <div className="flex items-center gap-2 mb-1 min-w-0">
        <h2 className="text-[#1A1A1A] font-bold text-[15px] leading-tight min-w-0 wrap-break-word">
          {post.title}
        </h2>
        <span className="bg-[#F5D90A] text-[#1A1A1A] font-bold text-xs px-2 py-0.5 rounded-full flex-shrink-0">
          {post.avg_rating.toFixed(1)}
        </span>
      </div>
      <p className="text-[#555] text-xs leading-relaxed line-clamp-2">
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
