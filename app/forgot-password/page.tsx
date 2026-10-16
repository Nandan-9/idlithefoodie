import type { Metadata } from "next";
import ForgotPasswordScreen from "@/components/mobile/ForgotPasswordScreen";

export const metadata: Metadata = { robots: { index: false } };

export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />;
}
