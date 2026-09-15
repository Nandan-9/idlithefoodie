"use client";

import { useEffect, useState } from "react";
import { Sparkle, Users } from "lucide-react";

const START_COUNT = 118;
const INCREMENT = 2;
const INTERVAL_MS = 20 * 60 * 1000;

export default function WaitlistCounter() {
  const [count, setCount] = useState(START_COUNT);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => c + INCREMENT);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const digits = String(count).padStart(5, "0").split("");

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl bg-white/70 p-6 text-center shadow-lg shadow-black/5 backdrop-blur-sm">
      <p className="flex items-center justify-center gap-2 text-base font-semibold text-[#1A1A1A]">
        <Users className="h-5 w-5 text-[#4B3DF2]" />
        Join <span className="text-[#4B3DF2]">{count.toLocaleString()}</span> food
        lovers on the waitlist
      </p>

      <div className="mt-4 flex items-center justify-center gap-2">
        <Sparkle className="h-5 w-5 shrink-0 text-[#4B3DF2]/50" />
        <div className="flex gap-1.5">
          {digits.map((d, i) => (
            <span
              key={i}
              className={`flex h-14 w-11 items-center justify-center rounded-xl border font-display text-3xl font-extrabold text-[#1A1A1A] sm:h-16 sm:w-12 ${
                i % 2 === 1
                  ? "border-[#4B3DF2]/15 bg-[#4B3DF2]/10"
                  : "border-[#4B3DF2]/10 bg-[#4B3DF2]/5"
              }`}
            >
              {d}
            </span>
          ))}
        </div>
        <Sparkle className="h-5 w-5 shrink-0 -scale-x-100 text-[#4B3DF2]/50" />
      </div>

      <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/40">
        People already signed up
      </p>
    </div>
  );
}
