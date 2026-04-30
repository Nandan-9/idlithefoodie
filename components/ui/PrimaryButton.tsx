import { ArrowRight } from "lucide-react";

interface PrimaryButtonProps {
  text: string;
}

export default function PrimaryButton({
  text,
}: PrimaryButtonProps) {
  return (
    <button className="group bg-[#6D28D9] hover:bg-[#5B21B6] transition-all duration-300 text-white px-8 py-4 rounded-2xl text-lg font-bold flex items-center gap-3 shadow-lg">
      {text}

      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}