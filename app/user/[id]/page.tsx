import type { Metadata } from "next";
import UserProfileScreen from "@/components/mobile/profile/UserProfileScreen";
import { API_BASE } from "@/lib/config";
import type { Profile } from "@/types/profile";

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
    const res = await fetch(`${API_BASE}/accounts/profile/${id}/`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return {};
    const body = await res.json();
    const profile: Profile | undefined = body?.data ?? body;
    const displayName = profile?.name || profile?.username;
    if (!displayName) return {};

    const title = `${displayName} on Idli`;
    const description = profile?.bio || `See ${displayName}'s food finds on Idli`;
    return {
      title,
      description,
      alternates: { canonical: `/user/${id}` },
      openGraph: { title, description, type: "profile", images: [OG_IMAGE] },
      twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
    };
  } catch {
    return {};
  }
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;
  return <UserProfileScreen userId={Number(id)} />;
}
