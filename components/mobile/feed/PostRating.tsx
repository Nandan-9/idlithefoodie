"use client";

import type { Post } from "@/types/feed";
import Stars from "../explore/Stars";

type Props = {
  post: Post;
};

const CATEGORY_LABELS: Record<string, string> = {
  food: "Food",
  service: "Service",
  cleanliness: "Cleanliness",
  value: "Value",
};

export default function PostRating({ post }: Props) {
  if (post.ratings.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 px-1 py-2">
      {post.ratings.map((r) => (
        <div key={r.category} className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-[#1A1A1A] text-xs font-semibold">
              {CATEGORY_LABELS[r.category] ?? r.category}
            </span>
            <Stars value={r.score} size={16} />
          </div>
          {r.review.trim() !== "" && (
            <p className="pl-[88px] text-[#666] text-xs leading-snug">
              {r.review}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
