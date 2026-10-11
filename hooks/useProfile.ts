"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchProfile } from "@/lib/api";
import { useSession } from "@/app/providers";
import type { Profile, ProfileState } from "@/types/profile";

export function useProfile() {
  const { status } = useSession();
  const [state, setState] = useState<ProfileState>({
    profile: null,
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const profile = await fetchProfile();
      setState((s) => ({ ...s, profile, loading: false }));
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Could not load your profile. Tap retry.",
      }));
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") load();
  }, [load, status]);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  const setProfile = useCallback((profile: Profile) => {
    setState((s) => ({ ...s, profile }));
  }, []);

  return { ...state, refresh, setProfile };
}
