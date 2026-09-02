"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import WaitlistForm from "./WaitlistForm";

export default function HeroContent() {
  return (
    <div className="relative z-10 flex flex-col items-center">
      {/* mascot with glow */}
      <div className="relative mb-10 flex items-center justify-center">
        <div className="absolute h-64 w-64 rounded-full bg-[#6d35bb] opacity-40 blur-3xl" />
        <motion.div
          animate={{ y: [0, -16, 0], rotate: [-3, 3, -3] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/asset2/mascote.png"
            alt="Mascot"
            width={260}
            height={260}
            priority
            className="relative h-auto w-[200px] drop-shadow-2xl sm:w-[240px]"
          />
        </motion.div>
      </div>

      {/* headline — existing theme text */}
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
        Something Delicious
        <br />
        <span className="bg-linear-to-r from-[#fedc19] via-[#e9c9a0] to-[#8b5cf6] bg-clip-text text-transparent">
          Is Coming Soon
        </span>
      </h1>

      <p className="mt-6 max-w-md text-base leading-relaxed text-gray-400 sm:text-lg">
        Discover, share and devour the best food around you. Because calories
        don&rsquo;t count on weekends 😜
      </p>

      {/* status badge */}
      <div className="mt-10 flex items-center gap-2 text-sm font-medium text-gray-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fedc19] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#fedc19]" />
        </span>
        Launching Soon
      </div>

      <WaitlistForm />
    </div>
  );
}
