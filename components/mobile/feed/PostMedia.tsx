"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import type { Post, PostMediaItem } from "@/types/feed";

type Props = { post: Post };

export default function PostMedia({ post }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const media = post.media ?? [];
  const multiple = media.length > 1;
  const alt = post.hotel_name ?? post.description;

  // Track which slide is centred so the dot indicator stays in sync.
  useEffect(() => {
    if (!multiple) return;
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActive((prev) => (prev === idx ? prev : idx));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [multiple]);

  if (media.length === 0) return null;

  if (!multiple) {
    return <MediaSlide media={media[0]} alt={alt} scrollRoot={null} />;
  }

  return (
    <>
      <div
        ref={scrollRef}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {media.map((m, i) => (
          <div
            key={m.media_key || i}
            className="relative h-full w-full shrink-0 snap-start"
          >
            <MediaSlide media={m} alt={alt} scrollRoot={scrollRef} />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {media.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-4 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </>
  );
}

function MediaSlide({
  media,
  alt,
  scrollRoot,
}: {
  media: PostMediaItem;
  alt: string;
  scrollRoot: React.RefObject<HTMLDivElement | null> | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Try to play with sound; browsers block this until the user has interacted
    // with the page, so fall back to muted playback.
    const playWithFallback = () => {
      video.play().catch(() => {
        video.muted = true;
        setMuted(true);
        video.play().catch(() => {});
      });
    };

    // Only play while the slide is mostly on screen; pause and rewind once it has
    // scrolled mostly out of view so returning to it replays from the start. The
    // root is the horizontal strip for a carousel, or the viewport otherwise.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.6) {
          playWithFallback();
        } else if (entry.intersectionRatio < 0.3) {
          video.pause();
          video.currentTime = 0;
        }
      },
      { threshold: [0, 0.3, 0.6], root: scrollRoot?.current ?? null }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [scrollRoot]);

  const toggleMuted = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setMuted(next);
    if (!next) video.play().catch(() => {});
  };

  if (media.content_type === "video") {
    return (
      <>
        <video
          ref={videoRef}
          src={media.media_url}
          poster={media.thumbnail_url || undefined}
          loop
          playsInline
          onClick={toggleMuted}
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={toggleMuted}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute bottom-3 right-3 rounded-full bg-black/50 p-2 text-white"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </>
    );
  }

  if (!media.media_url) return null;

  return (
    <Image
      src={media.media_url}
      alt={alt}
      fill
      unoptimized
      className="object-cover"
      sizes="(max-width: 640px) 100vw, 640px"
      placeholder={media.thumbnail_url ? "blur" : "empty"}
      blurDataURL={media.thumbnail_url || undefined}
    />
  );
}
