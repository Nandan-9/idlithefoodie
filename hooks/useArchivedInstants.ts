"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchArchivedInstants } from "@/lib/api";
import type { ArchiveInstantPick } from "@/types/archive";

/** The current user's archived instants — candidates for an archive. */
export function useArchivedInstants() {
  const [items, setItems] = useState<ArchiveInstantPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchArchivedInstants());
    } catch {
      setError("Could not load your instants. Tap retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, error, refresh: load };
}
