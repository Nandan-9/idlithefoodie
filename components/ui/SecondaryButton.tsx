interface SecondaryButtonProps {
  text: string;
}

export default function SecondaryButton({
  text,
}: SecondaryButtonProps) {
  return (
    <button className="border-2 border-[#7C3AED] text-[#7C3AED] px-8 py-4 rounded-2xl text-lg font-bold bg-white hover:bg-[#F3E8FF] transition-all duration-300">
      {text}
    </button>
  );
}