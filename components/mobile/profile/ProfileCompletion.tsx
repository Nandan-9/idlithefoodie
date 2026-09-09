"use client";

import { useRouter } from "next/navigation";

type Props = {
  percentage: number;
  incompleteFields: string[];
};

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  avatar: "Profile photo",
  bio: "Bio",
  location: "Location",
  diet: "Diet preference",
  dob: "Date of birth",
  food_preference: "Food preference",
};

export default function ProfileCompletion({
  percentage,
  incompleteFields,
}: Props) {
  const router = useRouter();
  const pct = Math.max(0, Math.min(100, percentage ?? 0));
  const missing = (incompleteFields ?? [])
    .map((f) => FIELD_LABELS[f] ?? prettyField(f))
    .join(", ");

  return (
    <button
      onClick={() =>
        router.push(
          `/profile/edit?fields=${(incompleteFields ?? []).join(",")}`
        )
      }
      className="flex w-full items-center gap-2.5 rounded-[14px] border border-[#6F2DBD]/40 bg-[#F0EAFB] px-4 py-3 text-left active:scale-[0.99] transition-transform"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-[#1A1A1A]">
          Profile {pct}% complete
        </span>
        {missing && (
          <span className="block truncate text-[11px] text-[#555]">
            Missing: {missing}
          </span>
        )}
      </span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}

function prettyField(f: string): string {
  return f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
