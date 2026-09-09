"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/types/feed";
import { formatTimeAgo } from "@/components/mobile/explore/timeAgo";

type Props = {
  post: Post;
  onDeleteRating: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function PostHeader({ post, onDeleteRating, onEdit, onDelete }: Props) {
  const avatarUrl = post.avatar || undefined;
  const canDeleteRating = post.is_mine && post.ratings.length > 0;
  const hasMenu = canDeleteRating || (post.is_mine && (onEdit || onDelete));

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  return (
    <div className="flex items-center justify-between px-3 pt-3 pb-2">
      <div className="flex items-center gap-2 min-w-0">
        <Link
          href={`/user/${post.user.id}`}
          className="w-9 h-9 rounded-full overflow-hidden bg-[#E5E0F5] flex-shrink-0 active:opacity-80"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={post.user.username}
              width={36}
              height={36}
              unoptimized
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-[#9B8DC4] flex items-center justify-center text-white text-sm font-bold">
              {post.user.username[0]?.toUpperCase()}
            </div>
          )}
        </Link>
        <div className="min-w-0">
          <Link
            href={`/user/${post.user.id}`}
            className="block leading-tight truncate text-[#1A1A1A] font-semibold text-sm active:opacity-80"
          >
            {post.user.username}
          </Link>
          <p className="text-[11px] leading-tight text-[#999]">
            {formatTimeAgo(post.created_at)}
          </p>
        </div>
      </div>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Post options"
          className="text-[#888] p-1 active:scale-90 transition-transform"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
        {menuOpen && hasMenu && (
          <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-2xl border border-[#E5E0F5] bg-white py-1 shadow-sm">
            {post.is_mine && onEdit && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
                className="w-full px-4 py-2 text-left text-sm font-medium text-[#1A1A1A] active:bg-[#F7F5FB]"
              >
                Edit post
              </button>
            )}
            {canDeleteRating && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteRating();
                }}
                className="w-full px-4 py-2 text-left text-sm font-medium text-[#E84855] active:bg-[#F7F5FB]"
              >
                Delete rating
              </button>
            )}
            {post.is_mine && onDelete && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                className="w-full px-4 py-2 text-left text-sm font-medium text-[#E84855] active:bg-[#F7F5FB]"
              >
                Delete post
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
