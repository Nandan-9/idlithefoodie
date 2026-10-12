import type { Metadata } from "next";
import SignupScreen from "@/components/mobile/SignupScreen";

export const metadata: Metadata = { robots: { index: false } };

export default function SignupPage() {
  return <SignupScreen />;
}
