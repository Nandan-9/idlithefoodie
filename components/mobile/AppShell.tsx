"use client";

import type { ReactNode } from "react";
import AppNav from "./AppNav";

type Tab = "home" | "explore" | "create" | "saved" | "profile";

type Props = {
  children: ReactNode;
  active?: Tab;
  nav?: boolean;
};

export default function AppShell({ children, active, nav = true }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2] lg:flex-row lg:justify-center">
      {nav && <AppNav active={active} />}
      <main
        className="relative flex min-h-screen w-full max-w-full min-w-0 flex-1 flex-col pb-24
                   lg:w-auto lg:max-w-[640px] lg:flex-none lg:border-x lg:border-[#E5E0F5] lg:pb-8"
      >
        {children}
      </main>
    </div>
  );
}
