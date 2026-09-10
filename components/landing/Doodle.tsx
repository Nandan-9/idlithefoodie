export default function Doodle({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 40"
      fill="none"
      className={className}
      stroke="#F5B942"
      strokeWidth={3}
      strokeLinecap="round"
    >
      <path d="M4 26c4-3 6-9 5-16" />
      <path d="M18 32c6-2 10-7 12-15" />
      <path d="M33 34c6 0 10-3 12-9" />
    </svg>
  );
}
