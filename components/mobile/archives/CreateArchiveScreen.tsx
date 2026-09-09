"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  addArchiveItems,
  createArchive,
  fetchArchiveDetail,
} from "@/lib/api";
import { useArchivedInstants } from "@/hooks/useArchivedInstants";
import AppShell from "@/components/mobile/AppShell";
import InstantThumbCell from "./InstantThumbCell";

const FOOD_EMOJIS = [
  "🍽️", "🍗", "🍖", "🍛", "🍚", "🍜", "🍲", "🥘", "🍝", "🍕",
  "🍔", "🌮", "🌯", "🥗", "🥙", "🧆", "🍣", "🍤", "🦐", "🐟",
  "🦀", "🥩", "🍳", "🥞", "🧇", "🍰", "🍩", "☕", "🍹", "🌊",
];

export default function CreateArchiveScreen() {
  const router = useRouter();
  const addToId = Number(useSearchParams().get("add")) || null;
  const isAdding = addToId != null;

  const { items, loading, error, refresh } = useArchivedInstants();

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍽️");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [alreadyIn, setAlreadyIn] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    if (addToId == null) return;
    let cancelled = false;
    fetchArchiveDetail(addToId)
      .then((a) => {
        if (!cancelled) setAlreadyIn(new Set(a.items.map((i) => i.id)));
      })
      .catch(() => {
        /* non-fatal — the picker just won't pre-exclude */
      });
    return () => {
      cancelled = true;
    };
  }, [addToId]);

  const pickable = useMemo(
    () => items.filter((i) => !alreadyIn.has(i.id)),
    [items, alreadyIn]
  );

  const canSave =
    selected.size > 0 && !saving && (isAdding || name.trim().length > 0);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setBanner(null);
    try {
      if (isAdding) {
        await addArchiveItems(addToId!, [...selected]);
        router.back();
      } else {
        await createArchive({
          name: name.trim(),
          emoji,
          post_ids: [...selected],
        });
        router.push("/profile");
      }
    } catch (err) {
      setBanner(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
      setSaving(false);
    }
  }

  return (
    <AppShell nav={false}>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E5E0F5] bg-white px-4 py-3">
        <button onClick={() => router.back()} className="-ml-1 p-1 text-[#6F2DBD]" aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-[#1A1A1A]">
          {isAdding ? "Add instants" : "New archive"}
        </h1>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="text-sm font-bold text-[#6F2DBD] disabled:opacity-40"
        >
          {saving ? "Saving…" : isAdding ? "Add" : "Create"}
        </button>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4">
        {banner && <p className="text-center text-sm text-red-500">{banner}</p>}

        {!isAdding && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setEmojiOpen((v) => !v)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#8B52D4] to-[#6F2DBD] text-2xl"
              >
                {emoji}
              </button>
              {emojiOpen && (
                <div className="absolute left-0 top-16 z-30 grid w-64 grid-cols-6 gap-1 rounded-2xl border border-[#E5E0F5] bg-white p-2 shadow-xl">
                  {FOOD_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => {
                        setEmoji(e);
                        setEmojiOpen(false);
                      }}
                      className="flex h-9 items-center justify-center rounded-lg text-xl active:bg-[#F5F2FB]"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              value={name}
              maxLength={100}
              placeholder="Archive name"
              onChange={(e) => setName(e.target.value)}
              className="flex-1 border-b border-[#E5E0F5] bg-transparent py-2 text-[15px] text-[#333] outline-none placeholder-[#BBB]"
            />
          </div>
        )}

        <p className="text-[13px] font-semibold text-[#555]">
          Select instants ({selected.size})
        </p>
      </div>

      {loading && items.length === 0 && (
        <div className="mt-2 grid grid-cols-3 gap-[0.5px]">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse bg-[#E5E0F5]" />
          ))}
        </div>
      )}

      {error && items.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <p className="text-sm text-[#555]">{error}</p>
          <button
            onClick={refresh}
            className="rounded-2xl bg-[#6F2DBD] px-6 py-3 text-sm font-bold text-white active:scale-95 transition-transform"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && pickable.length === 0 && (
        <p className="whitespace-pre-line px-6 py-10 text-center text-sm text-[#888]">
          {"No archived instants yet.\nInstants move here 24 hours after you post them."}
        </p>
      )}

      {pickable.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-[0.5px]">
          {pickable.map((it) => (
            <InstantThumbCell
              key={it.id}
              media={it.media}
              selectable
              selected={selected.has(it.id)}
              onTap={() => toggle(it.id)}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
