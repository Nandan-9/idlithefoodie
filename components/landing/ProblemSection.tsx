import Image from "next/image";
import { ArrowRight, LayoutGrid, Star, Users } from "lucide-react";
import Container from "@/components/layout/Container";
import RevealOnScroll from "./RevealOnScroll";
import Doodle from "./Doodle";

const JOURNEY = [
  { app: "Instagram", note: "see a photo", icon: "/assets/instragram.png" },
  { app: "Google Maps", note: "find the place", icon: "/assets/google_map.png" },
  { app: "Zomato", note: "check the reviews", icon: "/assets/zomato.png" },
  {
    app: "The restaurant",
    note: "hope it's worth it",
    icon: "/assets/restaurant.png",
  },
];

const PROBLEMS = [
  {
    title: "Discovery is scattered.",
    body: "The food content you trust is spread across five different apps, and none of them talk to each other.",
    Icon: LayoutGrid,
    badge: "bg-[#FDE9DF] text-[#E67B43]",
  },
  {
    title: "Reviews don't tell the real story.",
    body: "Star ratings miss the context that matters — what to order, when to go, what it's really like.",
    Icon: Star,
    badge: "bg-[#E3EDFB] text-[#3B7DE0]",
  },
  {
    title: "There's no real food community.",
    body: "Nowhere brings together the people in your city who actually care about food.",
    Icon: Users,
    badge: "bg-[#E2F2E7] text-[#3FA267]",
  },
];

export default function ProblemSection() {
  return (
    <section
      id="why-idli"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#FAF7F1] py-16"
    >
      <Container className="flex flex-col gap-10 sm:gap-12">
        {/* header row */}
        <RevealOnScroll>
          <div className="grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-[#C0894A]">
                Food discovery
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] text-[#1A1A1A] sm:text-5xl">
                Finding good food shouldn&rsquo;t feel like a part-time job.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#1A1A1A]/60 sm:text-base">
                Today, figuring out where to eat means bouncing between five
                different apps — and you still can&rsquo;t be sure it was the
                right call.
              </p>
            </div>

            <div className="relative order-first flex h-[240px] items-center justify-center sm:h-[360px] md:order-none">
              <div className="pointer-events-none absolute inset-0 m-auto h-[210px] w-[260px] bg-[#F6E7CF] [border-radius:42%_58%_63%_37%/45%_42%_58%_55%] sm:h-[320px] sm:w-[380px]" />
              <Doodle className="absolute -left-1 top-6 h-8 w-10 -rotate-12 sm:left-2 sm:h-10 sm:w-12" />
              <div className="pointer-events-none absolute bottom-6 h-4 w-40 rounded-[50%] bg-[#1A1A1A]/10 blur-md sm:bottom-8 sm:w-56" />
              <Image
                src="/assets/comfused.png"
                alt="Confused about where to eat"
                width={368}
                height={309}
                className="relative z-10 h-auto w-[190px] drop-shadow-xl sm:w-[320px]"
              />
            </div>
          </div>
        </RevealOnScroll>

        {/* the current journey — a genuine sequence */}
        <RevealOnScroll>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:flex sm:flex-nowrap sm:items-start sm:gap-2">
            {JOURNEY.map((step) => (
              <div
                key={step.app}
                className="flex items-start gap-2 sm:flex-1 sm:justify-center"
              >
                <div className="flex flex-1 flex-col items-center gap-2 text-center sm:flex-none">
                  <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                    <Image
                      src={step.icon}
                      alt={`${step.app} logo`}
                      width={48}
                      height={48}
                      className="h-8 w-8 object-contain"
                    />
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-[#1A1A1A]">
                      {step.app}
                    </p>
                    <p className="mt-0.5 text-xs text-[#1A1A1A]/55">
                      {step.note}
                    </p>
                  </div>
                </div>
                <ArrowRight className="mt-4 hidden h-5 w-5 shrink-0 text-[#4B3DF2] sm:block" />
              </div>
            ))}

            <div className="col-span-2 flex items-center justify-center sm:col-span-1 sm:shrink-0">
              <p className="rounded-2xl bg-[#4B3DF2]/10 px-5 py-4 text-center font-display text-sm font-bold leading-snug text-[#1A1A1A] sm:max-w-[11rem]">
                Still not sure it was the right choice?
              </p>
            </div>
          </div>
        </RevealOnScroll>

        {/* problem cards */}
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          {PROBLEMS.map((problem, i) => (
            <RevealOnScroll
              key={problem.title}
              delay={i * 0.1}
              className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${problem.badge}`}
              >
                <problem.Icon className="h-5 w-5" strokeWidth={2.4} />
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-[#1A1A1A]">
                  {problem.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#1A1A1A]/65">
                  {problem.body}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        {/* closing */}
        <RevealOnScroll className="mx-auto max-w-xl">
          <div className="relative text-center">
            <Doodle className="absolute -right-2 -top-6 h-7 w-9 rotate-12 sm:-right-8" />
            <p className="font-display text-2xl font-extrabold text-[#1A1A1A] sm:text-3xl">
              Food lovers deserve better.
            </p>
            <p className="mt-2 text-sm text-[#1A1A1A]/60 sm:text-base">
              It&rsquo;s time for one place built specifically for people who love
              food.
            </p>
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
