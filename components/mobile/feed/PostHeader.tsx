"use client";

import Image from "next/image";
import type { Post } from "@/types/feed";

type Props = { post: Post };

export default function PostHeader({ post }: Props) {
  const avatarUrl = post.avatar || undefined;
  const timeAgo = formatTimeAgo(post.created_at);

  return (
    <div className="flex items-center justify-between px-3 pt-3 pb-2">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-[#E5E0F5] flex-shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={post.user.username}
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-[#9B8DC4] flex items-center justify-center text-white text-sm font-bold">
              {post.user.username[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm leading-tight drop-shadow truncate">
            {post.user.username}
          </p>
          {post.hotel_name && (
            <p className="text-white/90 text-xs leading-tight drop-shadow truncate">
              {post.hotel_name}
            </p>
          )}
          <p className="text-white/70 text-xs drop-shadow">{timeAgo}</p>
        </div>
      </div>
      <button
        aria-label="Post options"
        className="text-white/80 p-1"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
