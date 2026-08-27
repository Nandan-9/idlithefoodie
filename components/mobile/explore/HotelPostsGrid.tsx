"use client";

import { useState } from "react";
import type { Post } from "@/types/feed";
import { formatTimeAgo } from "./timeAgo";
import StorefrontIcon from "./StorefrontIcon";

type Tab = "all" | "offers";

export default function HotelPostsGrid({ posts }: { posts: Post[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const visible = tab === "all" ? posts : [];

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between px-4 pt-5">
        <h2 className="font-bold text-[#6F2DBD]">All Posts</h2>
        <div className="flex items-center gap-1 rounded-full bg-[#F5F2FB] p-1">
          {(["all", "offers"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                tab === t ? "bg-[#6F2DBD] text-white" : "text-[#888]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="px-4 pt-6 text-sm text-[#888]">
          {tab === "offers" ? "No offers yet." : "No posts yet."}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3 px-4 pt-3">
          {visible.map((post) => (
            <div key={post.id}>
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#E5E0F5]">
                {post.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.thumbnail_url}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <StorefrontIcon size={28} />
                  </div>
                )}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-6">
                  <p className="line-clamp-1 text-[11px] font-semibold text-white">
                    {post.title}
                  </p>
                </div>

                {post.media_type === "video" && (
                  <span className="absolute right-1.5 top-1.5 text-white drop-shadow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-[#888]">
                {formatTimeAgo(post.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
