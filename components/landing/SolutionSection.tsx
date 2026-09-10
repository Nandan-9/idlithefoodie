import Image from "next/image";
import Container from "@/components/layout/Container";
import RevealOnScroll from "./RevealOnScroll";
import JoinWaitlistButton from "./JoinWaitlistButton";
import Doodle from "./Doodle";

const CARDS = [
  {
    num: "01",
    title: "Discover",
    body: "A location-based feed. See what people around you are eating, right now.",
    img: "/assets/map.png",
    bg: "bg-[#F9EBD7]",
    imgLeft: false,
  },
  {
    num: "02",
    title: "Share",
    body: "Post photos and videos of your own food experiences and recommendations.",
    img: "/assets/post.png",
    bg: "bg-[#ECE6F6]",
    imgLeft: false,
  },
  {
    num: null,
    title: "Food Explorers",
    body: "Discover trending dishes, hidden gems, and honest takes from people who live where you live.",
    img: "/assets/food.png",
    bg: "bg-[#E9F1E3]",
    imgLeft: true,
  },
  {
    num: null,
    title: "Food Creators",
    body: "Share your food stories and be part of a community that cares about food as much as you do.",
    img: "/assets/creator.png",
    bg: "bg-[#E6EDF8]",
    imgLeft: true,
  },
];

const CONTRASTS = [
  "Instagram is great for inspiration, not for finding food near you right now.",
  "Google Maps is great for directions, not for real recommendations from real people.",
  "IDLI is built for food lovers from the ground up — discovery and community in one place.",
];

export default function SolutionSection() {
  return (
    <>
      <section
        id="how-it-works"
        className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#FAF7F1] py-16"
      >
        <Container className="flex flex-col gap-10 sm:gap-12">
          {/* header row */}
          <RevealOnScroll>
            <div className="grid items-center gap-8 md:grid-cols-[1.05fr_0.95fr]">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-[#C0894A]">
                  Our community
                </p>
                <h2 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] text-[#1A1A1A] sm:text-5xl">
                  A community built for food lovers.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#1A1A1A]/60 sm:text-base">
                  IDLI is a location-based food community where people discover,
                  share, and talk about real food experiences — all in one feed.
                </p>
              </div>

              <div className="relative order-first flex h-[220px] items-center justify-center sm:h-[300px] md:order-none">
                <div className="pointer-events-none absolute inset-0 m-auto h-[190px] w-[280px] bg-[#FBEFC9] [border-radius:46%_54%_58%_42%/48%_44%_56%_52%] sm:h-[270px] sm:w-[420px]" />
                <Image
                  src="/assets/good_food.png"
                  alt="The IDLI mascot enjoying a burger — good food brings people together"
                  width={620}
                  height={318}
                  priority
                  className="relative z-10 h-auto w-[300px] drop-shadow-xl sm:w-[440px]"
                />
              </div>
            </div>
          </RevealOnScroll>

          {/* everything starts with the feed */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <RevealOnScroll>
              <p className="font-display text-base font-bold text-[#1A1A1A] sm:text-lg">
                Everything starts with the feed
              </p>
            </RevealOnScroll>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
              {CARDS.map((card, i) => (
                <RevealOnScroll
                  key={card.title}
                  delay={i * 0.1}
                  className={`relative flex items-center gap-4 overflow-hidden rounded-3xl p-5 sm:p-6 ${card.bg} ${
                    card.imgLeft ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    {card.num && (
                      <span className="font-display text-sm font-bold text-[#4B3DF2]">
                        {card.num}
                      </span>
                    )}
                    <h3 className="mt-1 font-display text-lg font-bold text-[#1A1A1A] sm:text-xl">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#1A1A1A]/65">
                      {card.body}
                    </p>
                  </div>
                  <Image
                    src={card.img}
                    alt=""
                    width={296}
                    height={197}
                    className="h-auto w-[96px] shrink-0 object-contain sm:w-[140px]"
                  />
                </RevealOnScroll>
              ))}
            </div>
          </div>

          {/* not another maps app or feed */}
          <RevealOnScroll>
            <p className="font-display text-base font-bold text-[#1A1A1A] sm:text-lg">
              Not another maps app or feed
            </p>
            <div className="mt-4 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <ul className="space-y-3">
                {CONTRASTS.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 text-sm leading-relaxed text-[#1A1A1A]/75 sm:text-base"
                  >
                    <span
                      aria-hidden
                      className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-[#F5B942]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#F5B942]" />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>

              <div className="relative order-first flex items-center justify-center md:order-none">
                <div className="pointer-events-none absolute inset-0 m-auto h-[140px] w-[240px] bg-[#F8E6D6] [border-radius:48%_52%_56%_44%/50%_46%_54%_50%] sm:h-[170px] sm:w-[300px]" />
                <Image
                  src="/assets/bottom-illus.png"
                  alt="A plate of tacos — real people, real food, real stories"
                  width={520}
                  height={260}
                  className="relative z-10 h-auto w-[260px] drop-shadow-lg sm:w-[340px]"
                />
              </div>
            </div>
          </RevealOnScroll>
        </Container>
      </section>

      {/* closing CTA banner — its own screen */}
      <section className="flex min-h-[100svh] flex-col justify-center bg-[#FAF7F1] py-16">
        <Container>
          <RevealOnScroll>
            <div className="relative overflow-hidden rounded-3xl bg-[#4B3DF2] px-6 py-12 text-center sm:px-10 sm:py-14 lg:py-20">
              {/* desktop side art (lg+) */}
              <Image
                src="/assets/good_food.png"
                alt=""
                aria-hidden
                width={620}
                height={318}
                className="pointer-events-none absolute -bottom-2 -left-4 hidden w-[280px] select-none lg:block xl:w-[360px]"
              />
              <Image
                src="/assets/map.png"
                alt=""
                aria-hidden
                width={300}
                height={200}
                className="pointer-events-none absolute right-[150px] top-4 hidden w-[120px] -rotate-6 select-none lg:block xl:right-[210px] xl:w-[145px]"
              />
              <Image
                src="/assets/post.png"
                alt=""
                aria-hidden
                width={300}
                height={200}
                className="pointer-events-none absolute right-4 top-8 hidden w-[145px] rotate-6 select-none lg:block xl:w-[170px]"
              />
              <Image
                src="/assets/bottom-illus.png"
                alt=""
                aria-hidden
                width={520}
                height={260}
                className="pointer-events-none absolute -bottom-2 -right-3 hidden w-[280px] select-none lg:block xl:w-[340px]"
              />
              <Doodle className="absolute left-8 top-12 hidden h-8 w-10 -rotate-12 lg:block" />
              <Doodle className="absolute bottom-16 right-12 hidden h-8 w-10 rotate-[40deg] lg:block" />

              <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center lg:max-w-lg">
                {/* stacked art for < lg */}
                <Image
                  src="/assets/good_food.png"
                  alt="The IDLI mascot enjoying a burger"
                  width={620}
                  height={318}
                  className="mb-6 h-auto w-[210px] sm:w-[250px] lg:hidden"
                />

                <h2 className="font-display text-3xl font-extrabold leading-[1.05] text-white sm:text-5xl xl:text-6xl">
                  Your next favorite meal{" "}
                  <span className="text-[#FCD34D]">
                    is closer than you think.
                  </span>
                </h2>
                <p className="mx-auto mt-4 max-w-md text-sm text-white/80 sm:text-base">
                  Join the waitlist and be one of the first to explore IDLI.
                </p>
                <JoinWaitlistButton className="mt-7" />

                <Image
                  src="/assets/bottom-illus.png"
                  alt="A plate of tacos — real people, real food, real stories"
                  width={520}
                  height={260}
                  className="mt-8 h-auto w-[240px] sm:w-[300px] lg:hidden"
                />
              </div>
            </div>
          </RevealOnScroll>
        </Container>
      </section>
    </>
  );
}
