"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroVisuals() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#6d35bb]">
      {/* soft decorative blobs */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#7C3AED] opacity-60 blur-2xl" />
      <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-[#fedc19] opacity-30 blur-3xl" />

      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="relative flex w-full max-w-[420px] flex-col items-center">
          {/* speech bubble */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="z-20 -rotate-[6deg] self-start"
          >
            <div className="relative rounded-3xl border-[4px] border-white bg-white px-7 py-4 shadow-xl">
              <p className="text-2xl font-black leading-tight text-[#6D28D9]">
                FOOD {">"}
                <br />
                EVERYTHING
              </p>
              <div className="absolute -bottom-[11px] left-10 h-5 w-5 rotate-45 border-b-[4px] border-r-[4px] border-white bg-white" />
            </div>
          </motion.div>

          {/* mascot */}
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 3.5, repeat: Infinity }}
            className="z-10 my-6"
          >
            <Image
              src="/asset2/mascote.png"
              alt="Mascot"
              width={430}
              height={190}
              priority
              className="h-auto w-[300px] drop-shadow-2xl sm:w-[360px]"
            />
          </motion.div>

          {/* sticker */}
          <motion.div
            animate={{ rotate: [-6, 6, -6] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="z-20 flex h-[150px] w-[150px] flex-col items-center justify-center self-end rounded-full bg-[#fedc19] text-center text-xl font-black leading-tight text-black shadow-2xl"
          >
            <span>EAT</span>
            <span>SLEEP</span>
            <span>REPEAT</span>
          </motion.div>

          <div className="absolute right-4 top-0 text-5xl text-[#fedc19]">✦</div>
          <div className="absolute bottom-4 left-0 text-5xl text-white">☆</div>
        </div>
      </div>
    </div>
  );
}
