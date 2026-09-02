"use client";

import type { Post } from "@/types/feed";

/**
 * Client-side like/save overrides.
 *
 * The feed payload is the source of truth on first load, but the backend can
 * lag (a like row exists yet `is_liked` still comes back `false`), and every
 * feed refetch / tab remount would otherwise wipe an optimistic toggle. So once
 * the user likes or saves a post we remember that intent here — in a
 * module-level store that outlives any single screen — and re-apply it on top
 * of whatever the feed returns until the feed agrees.
 */

type Override = {
  is_liked?: boolean;
  is_saved?: boolean;
};

const store = new Map<number, Override>();
const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version += 1;
  for (const l of listeners) l();
}

export function subscribeOverrides(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getOverridesVersion(): number {
  return version;
}

export function setOverride(id: number, patch: Override): void {
  store.set(id, { ...store.get(id), ...patch });
  emit();
}

/**
 * Drop an override once the freshly-fetched feed post matches it in every
 * field we track — from then on the feed can speak for itself.
 */
export function reconcileOverride(
  feedPost: Pick<Post, "id" | "is_liked" | "is_saved">
): void {
  const o = store.get(feedPost.id);
  if (!o) return;
  const likedSettled = o.is_liked === undefined || o.is_liked === feedPost.is_liked;
  const savedSettled = o.is_saved === undefined || o.is_saved === feedPost.is_saved;
  if (likedSettled && savedSettled) store.delete(feedPost.id);
}

/** Layer the stored overrides onto a list of feed posts. */
export function applyOverrides(posts: Post[]): Post[] {
  return posts.map((p) => {
    const o = store.get(p.id);
    if (!o) return p;

    let { is_liked, is_saved, like_count } = p;
    if (o.is_liked !== undefined && o.is_liked !== p.is_liked) {
      is_liked = o.is_liked;
      like_count = Math.max(0, p.like_count + (o.is_liked ? 1 : -1));
    }
    if (o.is_saved !== undefined) {
      is_saved = o.is_saved;
    }
    return { ...p, is_liked, is_saved, like_count };
  });
}
