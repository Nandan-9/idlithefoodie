"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Container from "@/components/layout/Container";
import { useWaitlist } from "./WaitlistModal";

const NAV_LINKS = [
  { href: "#why-idli", label: "Why Idli" },
  { href: "#how-it-works", label: "How it works" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const { open: openWaitlist } = useWaitlist();
  const reduce = useReducedMotion();

  useEffect(() => {
    const ids = ["why-idli", "how-it-works"];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      initial={reduce ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-black/5 bg-[#FAF7F1]"
    >
      <Container className="flex items-center justify-between py-3">
        <a
          href="#hero"
          className="flex items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B3DF2]"
          aria-label="IDLI home"
        >
          <Image
            src="/assets/idli-new-Photoroom.png"
            alt="IDLI"
            width={140}
            height={140}
            className="h-auto w-[64px] object-contain sm:w-[76px]"
            priority
          />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors hover:text-[#4B3DF2] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4B3DF2] ${
                active === link.href ? "text-[#4B3DF2]" : "text-[#1A1A1A]/70"
              }`}
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={openWaitlist}
            className="rounded-full bg-[#4B3DF2] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#3d31d0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B3DF2]"
          >
            Join Waitlist
          </button>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B3DF2] md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </Container>

      {open && (
        <div className="fixed inset-0 z-50 bg-[#FAF7F1] md:hidden">
          <Container className="flex items-center justify-between py-3">
            <Image
              src="/assets/idli-new-Photoroom.png"
              alt="IDLI"
              width={140}
              height={140}
              className="h-auto w-[64px] object-contain"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B3DF2]"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </Container>
          <nav className="flex flex-col gap-2 px-6 pt-10">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 font-display text-2xl font-bold text-[#1A1A1A]"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openWaitlist();
              }}
              className="mt-4 self-start rounded-full bg-[#4B3DF2] px-7 py-3 text-lg font-bold text-white"
            >
              Join Waitlist
            </button>
          </nav>
        </div>
      )}
    </motion.header>
  );
}
