"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sparkles,
  Flame,
  Pizza,
  IceCream,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#141414] text-white">
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-[-120px] left-[-120px] h-[320px] w-[320px] rounded-full bg-[#6F2DBD]/30 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-[#F5D90A]/20 blur-3xl" />
      </div>

      {/* Floating Icons */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute left-10 top-24 opacity-30"
      >
        <Pizza size={42} className="text-[#F5D90A]" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute right-12 top-40 opacity-30"
      >
        <IceCream size={40} className="text-[#6F2DBD]" />
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-32 left-16 opacity-20"
      >
        <Flame size={46} className="text-[#F5D90A]" />
      </motion.div>

      {/* Main Content */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* Mascot */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative mb-10"
        >
          <div className="absolute inset-0 rounded-full bg-[#6F2DBD]/30 blur-2xl" />

          <Image
            src="/asset2/mascote.png"
            alt="Mascot"
            width={260}
            height={260}
            priority
            className="relative z-10 object-contain drop-shadow-[0_0_40px_rgba(111,45,189,0.45)]"
          />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="max-w-4xl text-5xl font-black leading-tight md:text-7xl"
        >
          Something Delicious
          <span className="block bg-gradient-to-r from-[#F5D90A] to-[#6F2DBD] bg-clip-text text-transparent">
            Is Coming Soon
          </span>
        </motion.h1>


        {/* Bottom Accent */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 flex items-center gap-2 text-sm text-gray-500"
        >
          <div className="h-2 w-2 rounded-full bg-[#F5D90A]" />
          <span>Launching Soon</span>
        </motion.div>
      </section>
    </main>
  );
}