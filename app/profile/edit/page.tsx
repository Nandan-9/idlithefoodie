import { Suspense } from "react";
import EditProfileScreen from "@/components/mobile/profile/EditProfileScreen";

export default function EditProfilePage() {
  return (
    <Suspense fallback={null}>
      <EditProfileScreen />
    </Suspense>
  );
}
