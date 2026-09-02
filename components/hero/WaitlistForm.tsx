"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { joinWaitlist } from "@/lib/api";

type Status = "idle" | "submitting" | "done" | "error";

export default function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      await joinWaitlist(name.trim(), email.trim());
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Could not join the waitlist"
      );
    }
  }

  if (status === "done") {
    return (
      <p className="mt-8 max-w-md text-center text-base text-[#fedc19]">
        Thanks! You&rsquo;re on the list — we&rsquo;ll email you the moment we launch.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 flex w-full max-w-sm flex-col gap-3"
    >
      <input
        type="text"
        required
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#8b5cf6]"
      />
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#8b5cf6]"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="group flex items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-[#5B21B6] disabled:opacity-60"
      >
        {status === "submitting" ? "Joining…" : "Join the waitlist"}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
      {status === "error" && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </form>
  );
}
