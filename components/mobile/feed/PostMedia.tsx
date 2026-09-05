"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import type { Post } from "@/types/feed";

type Props = { post: Post };

export default function PostMedia({ post }: Props) {
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

    // Only play while the post is mostly on screen; pause and rewind once it has
    // scrolled mostly out of view so returning to it replays from the start.
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

  const media = post.media[0];
  if (!media) return null;

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
      alt={post.hotel_name ?? post.description}
      fill
      unoptimized
      className="object-cover"
      sizes="(max-width: 640px) 100vw, 640px"
      placeholder={media.thumbnail_url ? "blur" : "empty"}
      blurDataURL={media.thumbnail_url || undefined}
    />
  );
}
