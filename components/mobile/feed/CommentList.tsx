"use client";

import type { Comment } from "@/types/feed";

type Props = {
  comments: Comment[];
  loading: boolean;
  currentUsername?: string;
  onDelete?: (id: string) => void;
};

export default function CommentList({
  comments,
  loading,
  currentUsername,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-[#6F2DBD] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-center text-[#888] text-sm py-8">
        No comments yet. Be the first!
      </p>
    );
  }

  return (
    <div className="overflow-y-auto flex-1 px-4 py-2 space-y-4">
      {comments.map((c) => {
        const mine = onDelete && currentUsername && c.username === currentUsername;
        return (
          <div key={c.id} className="flex gap-3">
            {c.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.avatar}
                alt={c.username}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 bg-[#E5E0F5]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#E5E0F5] flex-shrink-0 flex items-center justify-center text-[#6F2DBD] font-bold text-sm">
                {c.username[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[#6F2DBD] font-semibold text-sm">
                {c.username}
              </span>
              <p className="text-[#333] text-sm leading-relaxed break-words">
                {c.content}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[#AAA] text-xs">
                  {formatTimeAgo(c.created_at)}
                </span>
                {mine && (
                  <button
                    onClick={() => onDelete!(c.id)}
                    className="text-[#E84855] text-xs font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
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
