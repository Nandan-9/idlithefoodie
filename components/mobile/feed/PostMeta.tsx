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
      <button
        type="button"
        onClick={onToggle}
        className={`w-full text-left text-[#1A1A1A] font-normal text-sm leading-relaxed ${
          expanded ? "block" : "line-clamp-1 min-h-[1.5em]"
        }`}
      >
        {post.description}
      </button>
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
