"use client";

import HomeView from "@/views/home/HomeView";
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
      // <HomeView 
      <div className="min-h-screen bg-[#f7efe4] overflow-hidden relative flex items-center justify-center px-6">
  {/* Background Glow */}
  <div className="absolute top-[-120px] right-[-120px] w-[350px] h-[350px] bg-purple-300 rounded-full blur-3xl opacity-30"></div>
  <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-yellow-200 rounded-full blur-3xl opacity-30"></div>

  {/* Main Container */}
  <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
    
    {/* Left Side */}
    <div className="relative flex justify-center">
      {/* Blob */}
      <div className="absolute w-[380px] h-[380px] bg-purple-500 rounded-full blur-3xl opacity-20"></div>

      {/* Card */}
      <div className="relative bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[40px] p-8 w-[320px]">
        
        {/* Floating Food Cards */}
        <div className="absolute -top-10 -left-14 bg-white rounded-2xl shadow-lg p-3 rotate-[-8deg]">
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591"
            alt=""
            className="w-24 h-24 object-cover rounded-xl"
          />
        </div>

        <div className="absolute -bottom-8 -right-10 bg-white rounded-2xl shadow-lg p-3 rotate-[10deg]">
          <img
            src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
            alt=""
            className="w-24 h-24 object-cover rounded-xl"
          />
        </div>

        {/* Mascot Circle */}
        <div className="w-36 h-36 mx-auto bg-[#f7efe4] rounded-full flex items-center justify-center shadow-inner">
          <span className="text-7xl">🍚</span>
        </div>

        {/* Text */}
        <h1 className="text-5xl font-black text-center mt-8 text-purple-700 tracking-tight">
          Idli
        </h1>

        <p className="text-center text-gray-600 mt-3 text-lg">
          Something delicious is cooking...
        </p>

        {/* Button */}
        <button className="mt-8 w-full bg-purple-600 hover:bg-purple-700 transition-all text-white font-semibold py-4 rounded-2xl shadow-lg">
          Notify Me
        </button>
      </div>
    </div>

    {/* Right Side */}
    <div className="text-center lg:text-left">
      <div className="inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full shadow-md mb-6">
        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        <span className="text-sm font-medium text-gray-700">
          Launching Soon
        </span>
      </div>

      <h2 className="text-6xl md:text-7xl font-black leading-none text-[#2d1b46]">
        COMING
        <br />
        <span className="text-purple-600">SOON</span>
      </h2>

      <p className="mt-8 text-xl text-gray-600 max-w-xl leading-relaxed">
        Discover trending food spots, share reels, rate dishes, and explore
        your city like never before. Built for foodies by foodies.
      </p>

      {/* Features */}
      <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
        {[
          "🍕 Food Reels",
          "📍 Nearby Spots",
          "⭐ Ratings",
          "🔥 Trending"
        ].map((item) => (
          <div
            key={item}
            className="bg-white shadow-md px-5 py-3 rounded-2xl text-gray-700 font-medium"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

  );
}