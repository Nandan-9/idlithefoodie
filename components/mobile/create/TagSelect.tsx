"use client";

import { useEffect, useState } from "react";
import { fetchTags } from "@/lib/api";
import type { Tag } from "@/types/feed";

type Props = {
  value: number[];
  onChange: (ids: number[]) => void;
  error?: string;
};

export default function TagSelect({ value, onChange, error }: Props) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchTags()
      .then((t) => {
        if (!cancelled) setTags(t);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (tags.length === 0) return null;

  function toggle(id: number) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  return (
    <div>
      <label className="text-[#888] text-xs font-medium ml-1">Tags (optional)</label>
      <div className="mt-1 flex flex-wrap gap-2">
        {tags.map((t) => {
          const active = value.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                active
                  ? "border-[#6F2DBD] bg-[#6F2DBD] text-white"
                  : "border-[#E5E0F5] bg-white text-[#333]"
              }`}
            >
              {t.name}
            </button>
          );
        })}
      </div>
      {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
    </div>
  );
}
