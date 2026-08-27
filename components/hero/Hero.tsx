import FloatingDoodles from "./FloatingDoodles";
import HeroContent from "./HeroContent";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#141216] px-6 text-center">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#6d35bb] opacity-30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[520px] w-[520px] rounded-full bg-[#fedc19] opacity-20 blur-[130px]" />

      <FloatingDoodles />
      <HeroContent />
    </section>
  );
}
