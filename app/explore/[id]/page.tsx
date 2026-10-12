import type { Metadata } from "next";
import HotelProfileScreen from "@/components/mobile/explore/HotelProfileScreen";
import { API_BASE } from "@/lib/config";
import type { HotelProfile } from "@/types/hotel";

const OG_IMAGE = {
  url: "/asset2/share-og.jpg",
  width: 1200,
  height: 630,
  alt: "Idli",
};

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_BASE}/hotel/profile/${id}/?platform=web`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return {};
    const body = await res.json();
    const hotel: HotelProfile | undefined = body?.data ?? body;
    if (!hotel?.name) return {};

    const title = `${hotel.name} on Idli`;
    const description =
      [hotel.address, hotel.city].filter(Boolean).join(", ") ||
      `Check out ${hotel.name} on Idli`;
    return {
      title,
      description,
      alternates: { canonical: `/explore/${id}` },
      openGraph: { title, description, type: "website", images: [OG_IMAGE] },
      twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
    };
  } catch {
    return {};
  }
}

export default async function HotelProfilePage({ params }: Props) {
  const { id } = await params;
  return <HotelProfileScreen hotelId={Number(id)} />;
}
