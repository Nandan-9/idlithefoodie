"use client";

import type { Post } from "@/types/feed";
import Stars from "../explore/Stars";

type Props = {
  post: Post;
  onRate: (stars: number) => void;
};

export default function PostRating({ post, onRate }: Props) {
  const rated = post.my_rating != null;

  return (
    <div className="flex items-center gap-2 px-1 py-2">
      <span className="text-[#888] text-xs font-medium">
        {rated ? "Your rating" : "Tap to rate"}
      </span>
      <Stars
        value={post.my_rating ?? 0}
        size={22}
        interactive={!rated}
        onChange={onRate}
      />
    </div>
  );
}
