"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import AppShell from "@/components/mobile/AppShell";
import CommentsSheet from "@/components/mobile/feed/CommentsSheet";
import { usePostActions } from "@/hooks/usePostActions";
import { useInstantFeed } from "@/hooks/useInstantFeed";
import type { Post } from "@/types/feed";

export default function InstantScreen() {
  const { posts, loading, error, refresh, setPosts } = useInstantFeed();
  const { toggleLike, toggleSave } = usePostActions();
  const [openCommentPostId, setOpenCommentPostId] = useState<number | null>(null);

  return (
    <AppShell active="instant">
      {/* Fills the viewport beside/above the nav so reels snap one per screen. */}
      <div className="fixed inset-x-0 top-0 bottom-[4.75rem] bg-black lg:static lg:h-[100dvh] lg:bottom-auto">
        {loading && posts.length === 0 ? (
          <CenterState>
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div
                className="absolute inset-0 rounded-full border-white/80 border-t-transparent animate-spin"
                style={{ borderWidth: 3 }}
              />
              <span className="text-xl">⚡</span>
            </div>
            <p className="text-sm text-white/70">Loading instant clips…</p>
          </CenterState>
        ) : error && posts.length === 0 ? (
          <CenterState>
            <p className="font-semibold text-[#E84855]">{error}</p>
            <button
              onClick={refresh}
              className="rounded-2xl bg-white/15 px-6 py-3 font-bold text-white active:scale-95"
            >
              Retry
            </button>
          </CenterState>
        ) : posts.length === 0 ? (
          <CenterState>
            <span className="text-4xl">⚡</span>
            <p className="text-lg font-bold text-white">No instant clips yet</p>
            <p className="text-sm text-white/60">Check back soon.</p>
            <button onClick={refresh} className="text-sm font-semibold text-white/80">
              Refresh
            </button>
          </CenterState>
        ) : (
          <div
            className="h-full snap-y snap-mandatory overflow-y-scroll"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {posts.map((post) => (
              <Reel
                key={post.id}
                post={post}
                onLike={() => toggleLike(post)}
                onSave={() => toggleSave(post)}
                onComment={() => setOpenCommentPostId(post.id)}
              />
            ))}
          </div>
        )}
      </div>

      {openCommentPostId !== null && (
        <CommentsSheet
          postId={openCommentPostId}
          onClose={() => setOpenCommentPostId(null)}
          onCommentCountChange={(delta) =>
            setPosts((ps) =>
              ps.map((p) =>
                p.id === openCommentPostId
                  ? { ...p, comment_count: Math.max(0, p.comment_count + delta) }
                  : p
              )
            )
          }
        />
      )}
    </AppShell>
  );
}

function CenterState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      {children}
    </div>
  );
}

function Reel({
  post,
  onLike,
  onSave,
  onComment,
}: {
  post: Post;
  onLike: () => void;
  onSave: () => void;
  onComment: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const media = post.media[0];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playWithFallback = () => {
      video.play().catch(() => {
        video.muted = true;
        setMuted(true);
        video.play().catch(() => {});
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.6) {
          playWithFallback();
        } else if (entry.intersectionRatio < 0.3) {
          video.pause();
          video.currentTime = 0;
        }
      },
      { threshold: [0, 0.3, 0.6] }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggleMuted = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setMuted(next);
    if (!next) video.play().catch(() => {});
  };

  return (
    <section className="relative h-full w-full shrink-0 snap-start bg-black">
      {media?.content_type === "video" && (
        <video
          ref={videoRef}
          src={media.media_url}
          poster={media.thumbnail_url || undefined}
          loop
          playsInline
          onClick={toggleMuted}
          className="h-full w-full object-cover"
        />
      )}

      {/* Top gradient + author */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-4 pb-10">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-white/20">
            {post.avatar ? (
              <Image
                src={post.avatar}
                alt={post.user.username}
                width={36}
                height={36}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                {post.user.username[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.6)]">
              {post.user.username}
            </p>
            {post.hotel_name && (
              <p className="truncate text-xs text-white/80 [text-shadow:0_1px_3px_rgb(0_0_0/0.6)]">
                {post.hotel_name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right action rail */}
      <div className="absolute bottom-24 right-3 flex flex-col items-center gap-5">
        <RailButton
          onClick={onLike}
          label={String(post.like_count)}
          active={post.is_liked}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill={post.is_liked ? "#F5D90A" : "none"} stroke={post.is_liked ? "#F5D90A" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </RailButton>

        <RailButton onClick={onComment} label={String(post.comment_count)}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </RailButton>

        <RailButton onClick={onSave} active={post.is_saved}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill={post.is_saved ? "#F5D90A" : "none"} stroke={post.is_saved ? "#F5D90A" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </RailButton>

        <button
          onClick={toggleMuted}
          aria-label={muted ? "Unmute" : "Mute"}
          className="rounded-full bg-black/40 p-2 text-white"
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Bottom gradient + description */}
      {post.description && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pb-24 pr-16">
          <p className="line-clamp-3 text-sm text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.6)]">
            {post.description}
          </p>
        </div>
      )}
    </section>
  );
}

function RailButton({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void;
  label?: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
    >
      <span className="drop-shadow-[0_1px_3px_rgb(0_0_0/0.6)]">{children}</span>
      {label !== undefined && (
        <span
          className="text-xs font-semibold text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.6)]"
          style={active ? { color: "#F5D90A" } : undefined}
        >
          {label}
        </span>
      )}
    </button>
  );
}
