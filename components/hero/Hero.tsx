import FloatingDoodles from "./FloatingDoodles";
import HeroContent from "./HeroContent";
import HeroVisuals from "./HeroVisuals";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f8f6f2]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">

        {/* LEFT CONTENT */}
        <div
          className="
            relative z-20
            flex flex-col justify-center
            px-6 py-16
            sm:px-10
            lg:px-16
            xl:px-24
            order-2 lg:order-1
          "
        >
          <HeroContent />

          {/* extra content under HeroContent */}
          <div className="ml-17 mt-8 max-w-md">
            <p className="inline-block bg-yellow-300 px-4 py-2 text-lg font-semibold rounded-md text-black">
            for foodies by foodies 💜
            </p>

            <p className="mt-6 text-gray-700 text-lg leading-relaxed">
              Discover, share and devour the best food around you.
              Because calories don’t count on weekends 😜
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="rounded-2xl bg-[#6d35bb] px-8 py-4 text-white font-semibold shadow-lg">
                Coming Soon →
              </button>
            </div>
          </div>
        </div>

        <FloatingDoodles />

        {/* RIGHT VISUAL */}
        <div
          className="
            relative
            h-[50vh]
            sm:h-[60vh]
            lg:h-screen
            order-1 lg:order-2
          "
        >
          <HeroVisuals />
        </div>
      </div>
    </section>
  );
}