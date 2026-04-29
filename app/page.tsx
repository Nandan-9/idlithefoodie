"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Flame,
  Pizza,
  IceCream,
  Star,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffdf5] text-[#2b124c]">
      {/* Background blobs */}
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-yellow-300 blur-3xl opacity-40" />
      <div className="absolute top-40 right-0 h-[30rem] w-[30rem] rounded-full bg-purple-400 blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-yellow-200 blur-3xl opacity-30" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-16">
        <div className="flex items-center gap-2">
          <div className="rounded-2xl bg-yellow-300 p-3 shadow-lg">
            <Pizza className="h-6 w-6 text-purple-900" />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight">Idlie</h1>
            <p className="text-xs font-medium text-purple-700">
              for foodies by foodies
            </p>
          </div>
        </div>

        <button className="rounded-full bg-purple-700 px-5 py-3 text-sm font-bold text-white transition hover:scale-105 hover:bg-purple-800">
          Download App
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center px-6 pt-10 text-center lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 shadow-md">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-semibold">
              Warning: may cause extreme cravings
            </span>
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
            Swipe.
            <span className="text-yellow-500"> Drool.</span>
            <br />
            Repeat.
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-purple-800">
            Idlie is where hungry legends discover chaotic food combos,
            midnight snacks, hidden gems, and dangerously good memes.
            Built by foodies. Powered by cravings.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="group flex items-center gap-2 rounded-full bg-yellow-400 px-8 py-4 text-lg font-black text-purple-950 shadow-xl transition hover:scale-105">
              Feed Me Now
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </button>

            <button className="rounded-full border-2 border-purple-300 bg-white px-8 py-4 text-lg font-bold transition hover:bg-purple-100">
              Explore Food Chaos
            </button>
          </div>
        </motion.div>

        {/* Floating food cards */}
        <div className="relative mt-24 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: Flame,
              title: "Hot Takes",
              text: "Pineapple on pizza? We start wars daily.",
              color: "bg-yellow-300",
            },
            {
              icon: IceCream,
              title: "Mood Meals",
              text: "Sad? Angry? Heartbroken? We got snacks for that.",
              color: "bg-purple-300",
            },
            {
              icon: Star,
              title: "Foodie Fame",
              text: "Rate dishes like a dramatic reality show judge.",
              color: "bg-white",
            },
          ].map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`${card.color} rounded-[2rem] border border-white/40 p-8 shadow-2xl backdrop-blur-xl`}
            >
              <card.icon className="mb-5 h-10 w-10 text-purple-900" />

              <h3 className="text-2xl font-black">{card.title}</h3>

              <p className="mt-3 text-base leading-relaxed text-purple-900/80">
                {card.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Meme style banner */}
        <div className="mt-24 mb-20 rounded-[3rem] bg-purple-900 px-8 py-14 text-white shadow-2xl">
          <h2 className="text-4xl font-black md:text-5xl">
            Your diet called.
            <br />
            We blocked the number.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-purple-100">
            Join thousands of chaotic foodies discovering the best bites around
            them — one greasy recommendation at a time.
          </p>

          <button className="mt-10 rounded-full bg-yellow-400 px-8 py-4 text-lg font-black text-purple-950 transition hover:scale-105">
            Join the Craving Cult
          </button>
        </div>
      </section>
    </main>
  );
}