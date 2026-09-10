"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import WaitlistForm from "@/components/hero/WaitlistForm";

const WaitlistContext = createContext<{ open: () => void }>({ open: () => {} });

export function useWaitlist() {
  return useContext(WaitlistContext);
}

export default function WaitlistProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  return (
    <WaitlistContext.Provider value={{ open }}>
      {children}

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-modal-title"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative w-full max-w-md rounded-2xl bg-[#FAF7F1] p-7 shadow-2xl">
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#1A1A1A]/60 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B3DF2]"
            >
              <X className="h-4 w-4" />
            </button>
            <h2
              id="waitlist-modal-title"
              className="font-display text-2xl font-extrabold text-[#1A1A1A]"
            >
              Be the first to taste it.
            </h2>
            <p className="mt-2 text-sm text-[#1A1A1A]/70">
              We&rsquo;re building Kerala&rsquo;s food community, one foodie at a
              time. Join the waitlist for early access.
            </p>
            <WaitlistForm />
          </div>
        </div>
      )}
    </WaitlistContext.Provider>
  );
}
