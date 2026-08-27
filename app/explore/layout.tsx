import type { ReactNode } from "react";
import AuthGate from "@/components/AuthGate";

export default function ExploreLayout({ children }: { children: ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
