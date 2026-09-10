"use client";

import { ArrowRight } from "lucide-react";
import { useWaitlist } from "./WaitlistModal";

export default function JoinWaitlistButton({
  className = "",
}: {
  className?: string;
}) {
  const { open } = useWaitlist();

  return (
    <button
      type="button"
      onClick={open}
      className={`group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#4B3DF2] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${className}`}
    >
      Join the Waitlist
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}
