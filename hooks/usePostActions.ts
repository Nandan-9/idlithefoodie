"use client";

import { useCallback } from "react";
import {
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  ratePost,
  unratePost,
} from "@/lib/api";
import { setOverride } from "@/lib/postOverrides";
import type { Post } from "@/types/feed";

/**
 * Like / save toggles.
 *
 * State lives in the module-level override store (`lib/postOverrides.ts`), not
 * in a screen's React state, so an optimistic toggle survives feed refetches
 * and tab remounts. We flip the override immediately, then reconcile it with
 * the authoritative boolean the API returns (or revert on failure).
 */
export function usePostActions() {
  const toggleLike = useCallback(async (post: Post) => {
    const next = !post.is_liked;
    setOverride(post.id, { is_liked: next });

    try {
      const liked = next ? await likePost(post.id) : await unlikePost(post.id);
      setOverride(post.id, { is_liked: liked });
    } catch {
      setOverride(post.id, { is_liked: !next });
    }
  }, []);

  const toggleSave = useCallback(async (post: Post) => {
    const next = !post.is_saved;
    setOverride(post.id, { is_saved: next });

    try {
      const saved = next ? await savePost(post.id) : await unsavePost(post.id);
      setOverride(post.id, { is_saved: saved });
    } catch {
      setOverride(post.id, { is_saved: !next });
    }
  }, []);

  const rate = useCallback(async (post: Post, stars: number) => {
    if (post.my_rating != null) return; // one rating per post — read-only once set
    setOverride(post.id, { my_rating: stars });

    try {
      await ratePost(post.id, stars);
    } catch {
      setOverride(post.id, { my_rating: post.my_rating ?? null });
    }
  }, []);

  const deleteRating = useCallback(async (post: Post) => {
    if (post.my_rating == null) return;
    setOverride(post.id, { my_rating: null });

    try {
      await unratePost(post.id);
    } catch {
      setOverride(post.id, { my_rating: post.my_rating });
    }
  }, []);

  return { toggleLike, toggleSave, rate, deleteRating };
}
