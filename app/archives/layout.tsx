import type { Metadata } from "next";
import type { ReactNode } from "react";
import AuthGate from "@/components/AuthGate";

export const metadata: Metadata = { robots: { index: false } };

export default function ArchivesLayout({ children }: { children: ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
