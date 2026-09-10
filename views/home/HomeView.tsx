import SiteHeader from "@/components/landing/SiteHeader";
import SiteFooter from "@/components/landing/SiteFooter";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import WaitlistProvider from "@/components/landing/WaitlistModal";

export default function HomeView() {
  return (
    <WaitlistProvider>
      <SiteHeader />
      <main className="bg-[#FAF7F1] text-[#1A1A1A]">
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
      </main>
      <SiteFooter />
    </WaitlistProvider>
  );
}
