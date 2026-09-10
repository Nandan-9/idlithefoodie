import Image from "next/image";
import Container from "@/components/layout/Container";
import RevealOnScroll from "./RevealOnScroll";

export default function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-[#FAF7F1]">
      <RevealOnScroll>
      <Container className="flex flex-col items-start gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/assets/idli-new-Photoroom.png"
            alt="IDLI"
            width={140}
            height={140}
            className="h-auto w-[64px] object-contain"
          />
          <p className="text-sm font-medium text-[#1A1A1A]/60">
            Real people. Real reviews. Real good food.
          </p>
        </div>
        <nav className="flex gap-6 text-sm font-semibold text-[#1A1A1A]/70">
          <a href="#why-idli" className="hover:text-[#4B3DF2]">
            Why Idli
          </a>
          <a href="#how-it-works" className="hover:text-[#4B3DF2]">
            How it works
          </a>
        </nav>
      </Container>
      </RevealOnScroll>
    </footer>
  );
}
