"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import { fetchExplorePosts } from "@/lib/api";
import {
  applyOverrides,
  reconcileOverride,
  subscribeOverrides,
  getOverridesVersion,
} from "@/lib/postOverrides";
import type { Post } from "@/types/feed";

/**
 * Explore search results. Debounces `query` changes, then fetches matching
 * posts. Local like/save/rating overrides are layered on at read time (same as
 * `useFeed`) so optimistic toggles in the opened post survive a refetch.
 */
export function useExplorePosts(query: string) {
  const [state, setState] = useState<{
    posts: Post[];
    loading: boolean;
    error: string | null;
  }>({ posts: [], loading: true, error: null });

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const posts = await fetchExplorePosts(query);
        for (const p of posts) reconcileOverride(p);
        if (!cancelled) setState({ posts, loading: false, error: null });
      } catch {
        if (!cancelled)
          setState({
            posts: [],
            loading: false,
            error: "Could not load results. Try again.",
          });
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, reloadKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

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

  return { posts, loading: state.loading, error: state.error, refresh, setPosts };
}
