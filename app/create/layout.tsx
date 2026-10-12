import type { Metadata } from "next";
import type { ReactNode } from "react";
import AuthGate from "@/components/AuthGate";

export const metadata: Metadata = { robots: { index: false } };

export default function CreateLayout({ children }: { children: ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
