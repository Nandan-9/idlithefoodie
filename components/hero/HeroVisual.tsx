"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroVisual() {
  return (
    <div className="relative w-full h-full overflow-hidden">

      {/* yellow bg */}
      <Image
        src="/asset2/bg-l1.png"
        alt="Yellow Shape"
        width={1000}
        height={1400}
        className="absolute right-[120px] scale-125 object-contain top-40"      />

      {/* purple blob */}
      <Image
        src="/asset2/bg-l2.png"
        alt="Purple Shape"
        width={750}
        height={750}
        className="absolute top-[180px] right-[40px] z-10 w-[620px] h-auto"
      />

      {/* curry bowl */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-[40px] right-[40px] z-40"
      >
        <Image
          src="/asset2/curry.png"
          alt="Curry"
          width={330}
          height={330}
          className="drop-shadow-2xl"
        />
      </motion.div>

      {/* mascot */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute left-[-20px] top-[180px] z-50"
      >
        <Image
          src="/asset2/mascote.png"
          alt="Mascot"
          width={280}
          height={280}
        />
      </motion.div>

      {/* burger */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute bottom-[20px] right-[20px] z-50"
      >
        <Image
          src="/asset2/burger.png"
          alt="Burger"
          width={470}
          height={470}
          className="drop-shadow-2xl"
        />
      </motion.div>

      {/* speech bubble */}
      <div className="absolute top-[60px] left-[40px] z-50 rotate-[-8deg]">
        <div className="relative bg-white border-[4px] border-[#6D28D9] rounded-full px-8 py-5 shadow-lg">
          <p className="text-[#6D28D9] font-black text-[30px] leading-tight">
            FOOD {">"}
            <br />
            EVERYTHING
          </p>

          <div className="absolute bottom-[-10px] left-12 w-6 h-6 bg-white border-r-[4px] border-b-[4px] border-[#6D28D9] rotate-45" />
        </div>
      </div>

      {/* sticker */}
      <div className="absolute bottom-[40px] right-[0px] rotate-[-12deg] z-50">
        <div className="bg-[#FFD600] w-[170px] h-[170px] rounded-full flex items-center justify-center shadow-2xl">
          <p className="text-black text-[32px] font-black leading-none text-center">
            EAT
            <br />
            SLEEP
            <br />
            REPEAT
          </p>
        </div>
      </div>

      {/* doodles */}
      <div className="absolute top-16 right-10 text-[#6D28D9] text-5xl z-50">
        ✦
      </div>

      <div className="absolute bottom-[220px] left-[40px] text-[#6D28D9] text-6xl z-50">
        ☆
      </div>
    </div>
  );
}