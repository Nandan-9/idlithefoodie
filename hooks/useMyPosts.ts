"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMyPosts } from "@/lib/api";
import type { Post } from "@/types/feed";

/** The authenticated user's own regular posts (feed shape). */
export function useMyPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPosts(await fetchMyPosts());
    } catch {
      setError("Could not load your posts. Tap retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { posts, loading, error, refresh: load };
}
