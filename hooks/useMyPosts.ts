"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchUserPosts } from "@/lib/api";
import { getUserId } from "@/lib/auth";
import type { Post } from "@/types/feed";

/** The authenticated user's own published posts (feed shape). */
export function useMyPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const userId = getUserId();
    if (userId === null) {
      setError("Could not load your posts. Tap retry.");
      setLoading(false);
      return;
    }
    try {
      setPosts(await fetchUserPosts(userId));
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
