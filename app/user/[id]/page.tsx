import UserProfileScreen from "@/components/mobile/profile/UserProfileScreen";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserProfileScreen userId={Number(id)} />;
}
