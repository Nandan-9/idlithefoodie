"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/app/providers";

export default function ProfileSettingsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { logout } = useSession();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className={`absolute right-0 top-0 flex h-full w-72 max-w-[80%] flex-col bg-white shadow-xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#E5E0F5] px-4 py-4">
          <h2 className="font-extrabold text-[#1A1A1A] text-base">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="text-[#888] active:scale-90 transition-transform"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          <Link
            href="/saved"
            onClick={onClose}
            className="rounded-xl px-3 py-3 text-sm font-semibold text-[#1A1A1A] active:bg-[#F5F2FB]"
          >
            Saved posts
          </Link>
        </nav>

        <div className="border-t border-[#E5E0F5] p-3">
          <button
            onClick={logout}
            className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#E84855] active:bg-[#FDECEE]"
          >
            Log out
          </button>
        </div>
      </aside>
    </div>
  );
}
