"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import { fetchFeed } from "@/lib/api";
import {
  applyOverrides,
  reconcileOverride,
  subscribeOverrides,
  getOverridesVersion,
} from "@/lib/postOverrides";
import type { FeedState, Post } from "@/types/feed";

export function useFeed() {
  // `state.posts` holds the raw feed payload; local like/save overrides are
  // layered on at read time so they survive refetches.
  const [state, setState] = useState<FeedState>({
    posts: [],
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const posts = await fetchFeed();
      // Let the feed retire any overrides it has now caught up with.
      for (const p of posts) reconcileOverride(p);
      setState((s) => ({ ...s, posts, loading: false }));
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Could not load feed. Pull down to retry.",
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  // Re-render whenever the override store changes.
  const overridesVersion = useSyncExternalStore(
    subscribeOverrides,
    getOverridesVersion,
    getOverridesVersion
  );

  const posts = useMemo(
    () => applyOverrides(state.posts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.posts, overridesVersion]
  );

  const setPosts = useCallback(
    (updater: (prev: Post[]) => Post[]) => {
      setState((s) => ({ ...s, posts: updater(s.posts) }));
    },
    []
  );

  return {
    posts,
    loading: state.loading,
    error: state.error,
    refresh,
    setPosts,
  };
}
