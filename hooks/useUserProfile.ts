"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchUserProfile, fetchUserRegularPosts } from "@/lib/api";
import type { Profile } from "@/types/profile";
import type { Post } from "@/types/feed";

/** Another user's public profile plus their regular posts, by user id. */
export function useUserProfile(userId: number) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, ps] = await Promise.all([
        fetchUserProfile(userId),
        fetchUserRegularPosts(userId),
      ]);
      setProfile(p);
      setPosts(ps);
    } catch {
      setError("Could not load this profile. Tap retry.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { profile, posts, loading, error, refresh: load };
}
