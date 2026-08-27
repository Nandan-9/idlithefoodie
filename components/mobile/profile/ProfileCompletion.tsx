"use client";

type Props = {
  percentage: number;
  incompleteFields: string[];
};

export default function ProfileCompletion({
  percentage,
  incompleteFields,
}: Props) {
  const pct = Math.max(0, Math.min(100, percentage ?? 0));

  return (
    <div className="mx-4 mb-4 rounded-3xl bg-white border border-[#E5E0F5] p-4 sm:mx-6">
      <div className="flex items-center justify-between">
        <span className="text-[#1A1A1A] font-bold text-sm">
          Complete your profile
        </span>
        <span className="text-[#6F2DBD] font-bold text-sm">{pct}%</span>
      </div>

      <div className="mt-2 h-2 w-full rounded-full bg-[#F0EAFB] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#6F2DBD] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {incompleteFields?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {incompleteFields.map((f) => (
            <span
              key={f}
              className="rounded-full bg-[#F8F5FF] text-[#6F2DBD] text-xs font-medium px-3 py-1"
            >
              {prettyField(f)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function prettyField(f: string): string {
  return f
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
