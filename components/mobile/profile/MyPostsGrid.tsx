"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Post, SavedPost } from "@/types/feed";
import { fetchSavedPosts } from "@/lib/api";
import FeedList from "@/components/mobile/feed/FeedList";

type Props = {
  posts: Post[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  setPosts: (updater: (prev: Post[]) => Post[]) => void;
};

type Tab = "posts" | "saved";

const MediaBadges = ({
  contentType,
  count,
}: {
  contentType?: string;
  count: number;
}) => (
  <>
    {contentType === "video" && (
      <span className="absolute top-1.5 right-1.5 text-white drop-shadow">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    )}
    {count > 1 && (
      <span className="absolute top-1.5 left-1.5 text-white drop-shadow">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M4 16V6a2 2 0 0 1 2-2h10" />
        </svg>
      </span>
    )}
  </>
);

export default function MyPostsGrid({
  posts,
  loading,
  error,
  refresh,
  setPosts,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("posts");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const [saved, setSaved] = useState<SavedPost[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);
  const [savedLoaded, setSavedLoaded] = useState(false);

  const loadSaved = useCallback(async () => {
    setSavedLoading(true);
    setSavedError(null);
    try {
      setSaved(await fetchSavedPosts());
      setSavedLoaded(true);
    } catch {
      setSavedError("Could not load your saved posts. Tap retry.");
    } finally {
      setSavedLoading(false);
    }
  }, []);

  function showSaved() {
    setTab("saved");
    if (!savedLoaded && !savedLoading) loadSaved();
  }

  useEffect(() => {
    if (openIndex == null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openIndex]);

  return (
    <section>
      {/* Tab bar — icon only */}
      <div className="flex border-b border-[#E5E0F5]">
        <button
          onClick={() => setTab("posts")}
          aria-label="Posts"
          className={`flex flex-1 items-center justify-center py-3 ${
            tab === "posts"
              ? "border-b-2 border-[#6F2DBD] text-[#6F2DBD]"
              : "text-[#888]"
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
        <button
          onClick={showSaved}
          aria-label="Saved"
          className={`flex flex-1 items-center justify-center py-3 ${
            tab === "saved"
              ? "border-b-2 border-[#6F2DBD] text-[#6F2DBD]"
              : "text-[#888]"
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={tab === "saved" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {tab === "posts" && (
        <>
          {loading && posts.length === 0 && (
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse bg-[#E5E0F5]" />
              ))}
            </div>
          )}

          {error && posts.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <p className="text-sm text-[#555]">{error}</p>
              <button
                onClick={refresh}
                className="rounded-2xl bg-[#6F2DBD] px-6 py-3 text-sm font-bold text-white active:scale-95 transition-transform"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="flex flex-col items-center gap-1.5 px-10 py-12 text-center">
              <span className="text-4xl">🍜</span>
              <p className="text-[15px] font-semibold text-[#1A1A1A]">
                Share your first dish
              </p>
              <p className="text-[12.5px] text-[#555]">
                Post a photo of something you ate and rate it.
              </p>
              <button
                onClick={() => router.push("/create")}
                className="mt-3 rounded-2xl bg-[#6F2DBD] px-6 py-3 text-sm font-bold text-white active:scale-95 transition-transform"
              >
                Add a dish
              </button>
            </div>
          )}

          {posts.length > 0 && (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post, i) => (
                <button
                  key={post.id}
                  onClick={() => setOpenIndex(i)}
                  className="relative aspect-square overflow-hidden rounded-md bg-[#E5E0F5]"
                >
                  {(post.media[0]?.thumbnail_url || post.media[0]?.media_url) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.media[0].thumbnail_url || post.media[0].media_url}
                      alt={post.hotel_name ?? post.description}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <MediaBadges
                    contentType={post.media[0]?.content_type}
                    count={post.media.length}
                  />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "saved" && (
        <>
          {savedLoading && saved.length === 0 && (
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse bg-[#E5E0F5]" />
              ))}
            </div>
          )}

          {savedError && saved.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <p className="text-sm text-[#555]">{savedError}</p>
              <button
                onClick={loadSaved}
                className="rounded-2xl bg-[#6F2DBD] px-6 py-3 text-sm font-bold text-white active:scale-95 transition-transform"
              >
                Retry
              </button>
            </div>
          )}

          {savedLoaded && !savedError && saved.length === 0 && (
            <div className="flex flex-col items-center gap-1.5 px-10 py-12 text-center">
              <span className="text-4xl">🔖</span>
              <p className="text-[15px] font-semibold text-[#1A1A1A]">
                No saved posts yet
              </p>
              <p className="text-[12.5px] text-[#555]">
                Tap the bookmark on a post to save it here.
              </p>
            </div>
          )}

          {saved.length > 0 && (
            <div className="grid grid-cols-3 gap-1">
              {saved.map((p) => (
                <div
                  key={p.id}
                  className="relative aspect-square overflow-hidden rounded-md bg-[#E5E0F5]"
                >
                  {p.media[0]?.thumbnail_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.media[0].thumbnail_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                  <MediaBadges
                    contentType={p.media[0]?.content_type}
                    count={p.media.length}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {openIndex != null && posts[openIndex] && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF7F2]">
          <button
            onClick={() => setOpenIndex(null)}
            aria-label="Back"
            className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1A1A1A] shadow-md active:scale-90 transition-transform"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <FeedList
            posts={posts}
            loading={false}
            error={null}
            onRefresh={refresh}
            setPosts={setPosts}
            initialPostId={posts[openIndex].id}
          />
        </div>
      )}
    </section>
  );
}
