"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchArchiveDetail } from "@/lib/api";
import type { ArchiveDetail } from "@/types/archive";

/** One archive with its items, by id. */
export function useArchiveDetail(id: number) {
  const [archive, setArchive] = useState<ArchiveDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setArchive(await fetchArchiveDetail(id));
    } catch {
      setError("Could not load this archive. Tap retry.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { archive, loading, error, refresh: load, setArchive };
}
