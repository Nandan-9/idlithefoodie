import HotelProfileScreen from "@/components/mobile/explore/HotelProfileScreen";

export default async function HotelProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HotelProfileScreen hotelId={Number(id)} />;
}
