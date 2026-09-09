"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  deleteArchive,
  removeArchiveItems,
  updateArchive,
} from "@/lib/api";
import { useArchiveDetail } from "@/hooks/useArchiveDetail";
import type { ArchivePostMedia } from "@/types/archive";
import AppShell from "@/components/mobile/AppShell";
import ConfirmDialog from "@/components/mobile/profile/ConfirmDialog";
import PromptDialog from "@/components/mobile/profile/PromptDialog";
import InstantThumbCell from "./InstantThumbCell";

export default function ArchiveDetailScreen({ id }: { id: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const readOnly = params.get("ro") === "1";
  const fallbackName = params.get("name") ?? "";
  const fallbackEmoji = params.get("emoji") ?? "";

  const { archive, loading, error, refresh, setArchive } = useArchiveDetail(id);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [lightbox, setLightbox] = useState<ArchivePostMedia | null>(null);
  const [busy, setBusy] = useState(false);

  const items = archive?.items ?? [];
  const title =
    (archive?.emoji || fallbackEmoji) + " " + (archive?.name || fallbackName);

  function exitSelection() {
    setSelectionMode(false);
    setSelected(new Set());
  }

  function toggle(postId: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  async function handleRemove() {
    if (selected.size === 0 || busy) return;
    setBusy(true);
    try {
      const updated = await removeArchiveItems(id, [...selected]);
      setArchive(updated);
      exitSelection();
    } catch {
      /* keep selection so the user can retry */
    } finally {
      setBusy(false);
    }
  }

  async function handleRename(name: string) {
    setShowRename(false);
    try {
      const updated = await updateArchive(id, { name });
      setArchive(updated);
    } catch {
      refresh();
    }
  }

  async function handleDelete() {
    setShowDelete(false);
    try {
      await deleteArchive(id);
      router.push("/profile");
    } catch {
      refresh();
    }
  }

  return (
    <AppShell nav={false}>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E5E0F5] bg-white px-4 py-3">
        <button
          onClick={() => (selectionMode ? exitSelection() : router.back())}
          className="-ml-1 p-1 text-[#6F2DBD]"
          aria-label="Back"
        >
          {selectionMode ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          )}
        </button>

        <h1 className="truncate px-2 text-base font-bold text-[#1A1A1A]">
          {selectionMode ? `${selected.size} selected` : title.trim()}
        </h1>

        {selectionMode ? (
          <button
            onClick={handleRemove}
            disabled={selected.size === 0 || busy}
            className="text-sm font-bold text-[#E84855] disabled:opacity-40"
          >
            Remove
          </button>
        ) : readOnly ? (
          <span className="w-6" />
        ) : (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1 text-[#1A1A1A]"
              aria-label="More"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-30 w-40 overflow-hidden rounded-2xl border border-[#E5E0F5] bg-white py-1 shadow-xl">
                {items.length > 0 && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setSelectionMode(true);
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm text-[#1A1A1A] active:bg-[#F5F2FB]"
                  >
                    Select
                  </button>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowRename(true);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-[#1A1A1A] active:bg-[#F5F2FB]"
                >
                  Rename
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowDelete(true);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-[#E84855] active:bg-[#FDECEE]"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {loading && !archive && (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
        </div>
      )}

      {error && !archive && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
          <p className="text-center text-sm text-[#555]">{error}</p>
          <button
            onClick={refresh}
            className="rounded-2xl bg-[#6F2DBD] px-6 py-3 text-sm font-bold text-white active:scale-95 transition-transform"
          >
            Retry
          </button>
        </div>
      )}

      {archive && items.length === 0 && (
        <p className="px-6 py-12 text-center text-sm text-[#888]">
          {readOnly
            ? "This archive is empty."
            : 'No instants here yet. Tap "Add instants".'}
        </p>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-[0.5px]">
          {items.map((it) => (
            <InstantThumbCell
              key={it.id}
              media={it.media}
              selectable={selectionMode}
              selected={selected.has(it.id)}
              onTap={() =>
                selectionMode
                  ? toggle(it.id)
                  : setLightbox(it.media[0] ?? null)
              }
            />
          ))}
        </div>
      )}

      {archive && !readOnly && !selectionMode && (
        <button
          onClick={() => router.push(`/archives/new?add=${id}`)}
          className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#6F2DBD] px-5 py-3 text-sm font-bold text-white shadow-lg active:scale-95 transition-transform"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add instants
        </button>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={() => setLightbox(null)}
        >
          {lightbox.content_type === "video" ? (
            <video
              src={lightbox.media_url}
              controls
              autoPlay
              className="max-h-full max-w-full"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lightbox.media_url || lightbox.thumbnail_url}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>
      )}

      {showRename && (
        <PromptDialog
          title="Rename archive"
          initialValue={archive?.name ?? ""}
          maxLength={100}
          onCancel={() => setShowRename(false)}
          onConfirm={handleRename}
        />
      )}

      {showDelete && (
        <ConfirmDialog
          title="Delete archive?"
          message="The archive is removed. Your instants stay in your account."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onCancel={() => setShowDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </AppShell>
  );
}
