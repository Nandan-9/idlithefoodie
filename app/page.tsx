import type { Metadata } from "next";
import HomeView from "@/views/home/HomeView";

export const metadata: Metadata = {
  title: "IDLI — Join the waitlist for Kerala's food community",
  description:
    "Join the IDLI waitlist for early access. See what people are actually eating near you, share your own food finds, and be part of a community that loves food as much as you do.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "IDLI — Join the waitlist for Kerala's food community",
    description:
      "See what people are actually eating near you, share your own food finds, and be part of a community that loves food as much as you do.",
    type: "website",
    siteName: "IDLI",
    images: [{ url: "/asset2/share-og.jpg", width: 1200, height: 630, alt: "Idli" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IDLI — Join the waitlist for Kerala's food community",
    description:
      "See what people are actually eating near you, share your own food finds, and be part of a community that loves food as much as you do.",
    images: ["/asset2/share-og.jpg"],
  },
};

export default function Home() {
  return <HomeView />;
}
