"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";
import { useWaitlist } from "./WaitlistModal";

export default function HeroSection() {
  const reduce = useReducedMotion();
  const { open: openWaitlist } = useWaitlist();

  const float = (opts: {
    y: number[];
    rotate: number[];
    duration: number;
  }) =>
    reduce
      ? undefined
      : {
          animate: { y: opts.y, rotate: opts.rotate },
          transition: {
            duration: opts.duration,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        };

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-20"
    >
      {/* soft ambient warmth */}
      <div className="pointer-events-none absolute -left-40 -top-32 h-[460px] w-[460px] rounded-full bg-[#F5B942] opacity-20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 top-40 h-[460px] w-[460px] rounded-full bg-[#4B3DF2] opacity-10 blur-[130px]" />

      <Container className="relative grid items-center gap-10 md:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#4B3DF2]/20 bg-[#4B3DF2]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#4B3DF2]">
            Launching soon in Kerala
          </span>

          <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-[#1A1A1A] sm:text-6xl">
            Your Favorite Food Is Closer Than You Think.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-[#1A1A1A]/70 sm:text-lg">
            IDLI is the food community built for real foodies — see what people
            are actually eating near you, share your own food finds, and be part
            of a community that cares about food as much as you do.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="button"
              onClick={openWaitlist}
              className="group inline-flex items-center gap-2 rounded-full bg-[#4B3DF2] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#3d31d0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B3DF2]"
            >
              Join the Waitlist
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <a
              href="#why-idli"
              className="text-sm font-semibold text-[#1A1A1A]/70 underline-offset-4 hover:text-[#4B3DF2] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4B3DF2]"
            >
              See why we&rsquo;re different
            </a>
          </div>
        </div>

        {/* mascot flanked by the floating discover / share illustrations */}
        <div className="relative mx-auto flex min-h-[320px] w-full max-w-[420px] items-center justify-center sm:min-h-[440px]">
          <div className="absolute h-56 w-56 rounded-full bg-[#F5B942] opacity-30 blur-3xl sm:h-72 sm:w-72" />

          <motion.div
            {...float({ y: [0, -15, 0], rotate: [-9, -4, -9], duration: 5.3 })}
            className="absolute -left-3 -top-4 z-20 w-[118px] -rotate-6 sm:-left-14 sm:top-0 sm:w-[176px]"
          >
            <Image
              src="/assets/discover_new.png"
              alt="Discover what people are eating near you"
              width={368}
              height={309}
              priority
              className="h-auto w-full drop-shadow-xl"
            />
          </motion.div>

          <motion.div
            {...float({ y: [0, -16, 0], rotate: [-3, 3, -3], duration: 4 })}
            className="relative z-10"
          >
            <Image
              src="/asset2/mascote.png"
              alt="The IDLI mascot"
              width={320}
              height={320}
              priority
              className="h-auto w-[190px] drop-shadow-2xl sm:w-[250px]"
            />
          </motion.div>

          <motion.div
            {...float({ y: [0, 12, 0], rotate: [8, 13, 8], duration: 6.2 })}
            className="absolute -bottom-6 right-1 z-20 w-[140px] rotate-[10deg] sm:-right-10 sm:bottom-4 sm:w-[196px]"
          >
            <Image
              src="/assets/share.png"
              alt="Share your own food finds"
              width={368}
              height={309}
              priority
              className="h-auto w-full drop-shadow-xl"
            />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
