import type { Metadata } from "next";
import HomeView from "@/views/home/HomeView";

export const metadata: Metadata = {
  title: "IDLI — Join the waitlist for Kerala's food community",
  description:
    "Join the IDLI waitlist for early access. See what people are actually eating near you, share your own food finds, and be part of a community that loves food as much as you do.",
};

export default function Home() {
  return <HomeView />;
}
