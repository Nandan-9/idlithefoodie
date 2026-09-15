import { redirect } from "next/navigation";
import { instantEnabled } from "@/lib/config";
import InstantScreen from "@/components/mobile/instant/InstantScreen";

export default function InstantPage() {
  if (!instantEnabled) {
    redirect("/feed");
  }
  return <InstantScreen />;
}
