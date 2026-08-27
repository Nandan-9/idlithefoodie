"use client";

import { useState } from "react";

type Props = {
  onSubmit: (content: string) => Promise<void>;
};

export default function CommentInput({ onSubmit }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await onSubmit(trimmed);
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-t border-[#E5E0F5]">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment…"
        className="flex-1 bg-[#F8F5FF] border border-[#E5E0F5] rounded-2xl px-4 py-2.5 text-sm text-[#333] placeholder-[#BBB] outline-none"
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || sending}
        className="bg-[#6F2DBD] text-white text-sm font-bold px-4 py-2.5 rounded-2xl disabled:opacity-50 active:scale-95 transition-transform"
      >
        {sending ? "…" : "Post"}
      </button>
    </div>
  );
}
