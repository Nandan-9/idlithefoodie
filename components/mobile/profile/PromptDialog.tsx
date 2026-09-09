"use client";

import { useState } from "react";

type Props = {
  title: string;
  initialValue?: string;
  placeholder?: string;
  maxLength?: number;
  confirmLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
};

export default function PromptDialog({
  title,
  initialValue = "",
  placeholder,
  maxLength,
  confirmLabel = "Save",
  onConfirm,
  onCancel,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const trimmed = value.trim();

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onCancel} aria-hidden />
      <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-3rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-[#1A1A1A]">{title}</h2>
        <input
          autoFocus
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && trimmed) onConfirm(trimmed);
          }}
          className="mt-4 w-full rounded-2xl border border-[#E5E0F5] px-4 py-3 text-[15px] text-[#333] outline-none placeholder-[#BBB]"
        />
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-[#E5E0F5] py-3 text-sm font-semibold text-[#6F2DBD] active:scale-95 transition-transform"
          >
            Cancel
          </button>
          <button
            onClick={() => trimmed && onConfirm(trimmed)}
            disabled={!trimmed}
            className="flex-1 rounded-2xl bg-[#6F2DBD] py-3 text-sm font-semibold text-white active:scale-95 transition-transform disabled:opacity-40"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
