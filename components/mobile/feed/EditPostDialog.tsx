"use client";

import { useState } from "react";
import type { Post } from "@/types/feed";

type Props = {
  post: Post;
  onSave: (description: string) => Promise<void>;
  onCancel: () => void;
};

export default function EditPostDialog({ post, onSave, onCancel }: Props) {
  const [description, setDescription] = useState(post.description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(description.trim());
    } catch {
      setError("Could not save changes. Try again.");
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onCancel}
        aria-hidden
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-3rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 shadow-xl">
        <h2 className="text-[#1A1A1A] font-bold text-lg">Edit post</h2>

        <div className="mt-4">
          <label className="text-[#888] text-xs font-medium ml-1">Description</label>
          <div className="mt-1 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-3 shadow-sm">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none bg-transparent text-[#333] text-[15px] outline-none"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-2xl border border-[#E5E0F5] py-3 text-[#6F2DBD] font-semibold text-sm active:scale-95 transition-transform disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-2xl bg-[#6F2DBD] py-3 text-white font-semibold text-sm active:scale-95 transition-transform disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </>
  );
}
