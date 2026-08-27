"use client";

import Image from "next/image";
import type { Post } from "@/types/feed";

type Props = { post: Post };

export default function PostMedia({ post }: Props) {
  if (post.media_type === "video") {
    return (
      <video
        src={post.media_url}
        poster={post.thumbnail_url || undefined}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <Image
      src={post.media_url}
      alt={post.title}
      fill
      className="object-cover"
      sizes="(max-width: 640px) 100vw, 640px"
      placeholder={post.thumbnail_url ? "blur" : "empty"}
      blurDataURL={post.thumbnail_url || undefined}
    />
  );
}
