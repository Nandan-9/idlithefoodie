import { Suspense } from "react";
import type { Metadata } from "next";
import HotelsListScreen from "@/components/mobile/hotels/HotelsListScreen";
import { API_BASE } from "@/lib/config";
import { slugify } from "@/lib/slug";

const OG_IMAGE = {
  url: "/asset2/share-og.jpg",
  width: 1200,
  height: 630,
  alt: "Idli",
};

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { place } = await searchParams;
  if (typeof place !== "string" || !place) {
    const title = "Find the best food spots near you — IDLI";
    const description =
      "Browse restaurants and hotels on the IDLI map and see what people are actually eating near you.";
    return {
      title,
      description,
      alternates: { canonical: "/hotels" },
      openGraph: { title, description, type: "website", images: [OG_IMAGE] },
      twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
    };
  }

  try {
    const res = await fetch(`${API_BASE}/hotel/list/?platform=web`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return {};
    const body = await res.json();
    const list: { name: string; address?: string; city?: string }[] = body?.data ?? body;
    const hotel = Array.isArray(list) ? list.find((h) => slugify(h.name) === place) : null;
    if (!hotel) return {};

    const title = `${hotel.name} on Idli`;
    const description =
      [hotel.address, hotel.city].filter(Boolean).join(", ") ||
      `Check out ${hotel.name} on Idli`;
    return {
      title,
      description,
      openGraph: { title, description, type: "website", images: [OG_IMAGE] },
      twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
    };
  } catch {
    return {};
  }
}

export default function HotelsPage() {
  return (
    <Suspense>
      <HotelsListScreen />
    </Suspense>
  );
}
