import type { ReactNode } from "react";
import AuthGate from "@/components/AuthGate";

export default function SavedLayout({ children }: { children: ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
