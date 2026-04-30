interface SectionBadgeProps {
  text: string;
}

export default function SectionBadge({
  text,
}: SectionBadgeProps) {
  return (
    <div className="inline-block bg-yellow-400 px-4 py-2 rounded-lg font-bold text-black text-lg">
      {text}
    </div>
  );
}