import { navLinks } from "@/lib/constants";

export default function NavLinks() {
  return (
    <div className="hidden lg:flex items-center gap-10">
      {navLinks.map((item, index) => (
        <button
          key={item}
          className={`text-lg font-semibold transition-all duration-300 hover:text-[#6D28D9] ${
            index === 0
              ? "bg-yellow-400 px-5 py-2 rounded-full"
              : "text-black"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}