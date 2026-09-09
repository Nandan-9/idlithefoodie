"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
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

  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
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
        error: "Could not load feed. Tap retry.",
      }));
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Web replacement for pull-to-refresh: refetch when the tab regains focus.
  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
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
