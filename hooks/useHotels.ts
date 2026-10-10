"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchHotels } from "@/lib/api";
import type { Hotel } from "@/types/feed";

type HotelsState = {
  hotels: Hotel[];
  loading: boolean;
  error: string | null;
};

// Survives client-side navigation so returning to /hotels renders the last
// known list immediately (then revalidates) instead of starting empty.
let cachedHotels: Hotel[] = [];

export function useHotels() {
  const [state, setState] = useState<HotelsState>({
    hotels: cachedHotels,
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const hotels = await fetchHotels();
      cachedHotels = hotels;
      setState((s) => ({ ...s, hotels, loading: false }));
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Could not load hotels. Tap retry.",
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  return { ...state, refresh };
}
