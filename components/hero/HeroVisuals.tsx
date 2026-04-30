import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroVisuals() {
  return (
    <div className="relative w-full h-screen">
      <Image
        src="/asset2/bg-l1.png"
        alt="Background Shape"
        fill
        priority
        className="object-cover object-right"
      />

      {/* circle container */}
      <div
        className="absolute top-[150px] right-[80px] z-10 rounded-full bg-[#6d35bb] "
        style={{
          width: "600px",
          height: "600px",
        }}
      >
        {/* curry */}
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-[20px] right-[-100px] z-20"
        >
          <Image
            src="/asset2/curry.png"
            alt="Curry"
            width={500}
            height={360}
            className="drop-shadow-2xl"
          />
        </motion.div>

        {/* mascot */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute left-[-200px] top-[100px] z-20"
        >
          <Image
            src="/asset2/mascote.png"
            alt="Mascot"
            width={500}
            height={220}
          />
        </motion.div>

        {/* burger */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-[-200px] right-[20px] z-20"
        >
          <Image
            src="/asset2/burger.png"
            alt="Burger"
            width={500}
            height={500}
            className="drop-shadow-2xl"
          />
        </motion.div>
      </div>
        <div className="absolute top-[160px] left-[40px] z-50 rotate-[-8deg]">
            <div className="relative bg-white border-[4px] border-[#6D28D9] rounded-full px-8 py-5 shadow-lg">
            <p className="text-[#6D28D9] font-black text-[30px] leading-tight">
                FOOD {">"}
                <br />
                EVERYTHING
            </p>

            <div className="absolute bottom-[-13px] left-12 w-6 h-6 bg-white border-r-[4px] border-b-[4px] border-[#6D28D9] rotate-45" />
            </div>
      </div>
                <div
                className="
                    absolute bottom-[120px] right-[150px] z-10
                    rounded-full bg-[#fedc19] shadow-2xl text-black
                    flex flex-col items-center justify-center
                    text-center font-bold leading-tight text-2xl
                "
                style={{
                    width: "190px",
                    height: "190px",
                }}
                >
                <span>EAT</span>
                <span>SLEEP</span>
                <span>REPEAT</span>
                  </div>
      <div className="absolute top-16 right-10 text-[#6D28D9] text-5xl z-50">
        ✦
      </div>

      <div className="absolute bottom-[220px] left-[40px] text-[#6D28D9] text-6xl z-50">
        ☆
      </div>

    </div>
  );
}