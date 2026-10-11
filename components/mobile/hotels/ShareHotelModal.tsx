"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { slugify } from "@/lib/slug";

type Props = {
  hotelName: string;
  onClose: () => void;
};

export default function ShareHotelModal({ hotelName, onClose }: Props) {
  const [message, setMessage] = useState(
    `Hey, checkout ${hotelName} why don't we go there`,
  );
  const [copied, setCopied] = useState(false);
  // Only rendered after a click, so browser APIs are always available.
  const canNativeShare = "share" in navigator;

  const url = `${window.location.origin}/hotels?place=${slugify(hotelName)}`;
  const text = `${message.trim()}\n${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ text: message.trim(), url });
    } catch {
      /* dismissed */
    }
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-black/40" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-label={`Share ${hotelName}`}
        className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-3rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-bold text-[#1A1A1A]">Share {hotelName}</h2>
        <textarea
          autoFocus
          value={message}
          maxLength={280}
          rows={3}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-4 w-full resize-none rounded-2xl border border-[#E5E0F5] px-4 py-3 text-[15px] text-[#333] outline-none"
        />
        <p className="mt-1 break-all text-xs text-[#888]">{url}</p>
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              onClick={copy}
              className="flex-1 rounded-2xl border border-[#E5E0F5] py-3 text-sm font-semibold text-[#6F2DBD] transition-transform active:scale-95"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            {canNativeShare && (
              <button
                onClick={nativeShare}
                className="flex-1 rounded-2xl border border-[#E5E0F5] py-3 text-sm font-semibold text-[#6F2DBD] transition-transform active:scale-95"
              >
                More…
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border border-[#E5E0F5] py-3 text-sm font-semibold text-[#555] transition-transform active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
