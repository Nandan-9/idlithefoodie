"use client";

import { useMyPosts } from "@/hooks/useMyPosts";

export default function MyPostsGrid() {
  const { posts, loading, error, refresh } = useMyPosts();

  return (
    <section className="pb-6">
      <h2 className="px-4 sm:px-6 pt-5 pb-2 font-extrabold text-[#1A1A1A] text-base">
        Posts
      </h2>

      {loading && posts.length === 0 && (
        <div className="flex justify-center py-10">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
        </div>
      )}

      {error && posts.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 px-6 text-center">
          <p className="text-[#555] text-sm">{error}</p>
          <button
            onClick={refresh}
            className="rounded-2xl bg-[#6F2DBD] text-white font-bold text-sm px-6 py-3 active:scale-95 transition-transform"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <p className="px-4 sm:px-6 py-8 text-sm text-[#888] text-center">
          You haven&apos;t posted anything yet.
        </p>
      )}

      {posts.length > 0 && (
        <div className="grid grid-cols-3 gap-1 p-1">
          {posts.map((post) => (
            <div
              key={post.id}
              className="relative aspect-square bg-[#E5E0F5]"
            >
              {post.media[0]?.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.media[0].thumbnail_url}
                  alt={post.hotel_name ?? post.description}
                  className="h-full w-full object-cover"
                />
              )}
              {post.media[0]?.content_type === "video" && (
                <span className="absolute top-1.5 right-1.5 text-white drop-shadow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
