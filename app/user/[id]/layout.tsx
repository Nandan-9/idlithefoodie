import type { ReactNode } from "react";
import AuthGate from "@/components/AuthGate";

export default function UserProfileLayout({ children }: { children: ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
