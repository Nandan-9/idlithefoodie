"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchHotels } from "@/lib/api";
import type { Hotel } from "@/types/feed";

type HotelsState = {
  hotels: Hotel[];
  loading: boolean;
  error: string | null;
};

export function useHotels() {
  const [state, setState] = useState<HotelsState>({
    hotels: [],
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const hotels = await fetchHotels();
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
