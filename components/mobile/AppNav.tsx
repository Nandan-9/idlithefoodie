"use client";

import Link from "next/link";

type Tab = "home" | "instant" | "explore" | "create" | "saved" | "profile";

type Props = { active?: Tab };

export default function AppNav({ active = "home" }: Props) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 flex items-center justify-around border-t border-[#E5E0F5] bg-white px-2 py-2
                 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:flex-col lg:items-stretch lg:justify-start lg:gap-1
                 lg:border-r lg:border-t-0 lg:px-3 lg:py-6"
    >
      <div className="hidden lg:mb-4 lg:block lg:px-4">
        <span className="text-lg font-extrabold text-[#6F2DBD]">idli</span>
      </div>

      <NavBtn href="/feed" icon={<HomeIcon />} label="Home" active={active === "home"} />
      <NavBtn href="/instant" icon={<InstantIcon />} label="Instant" active={active === "instant"} />

      {/* Create button */}
      <Link
        href="/create"
        className="flex items-center justify-center bg-[#6F2DBD] text-white shadow-lg transition-transform active:scale-90
                   -mt-3 h-12 w-12 rounded-full
                   lg:mt-0 lg:h-auto lg:w-full lg:justify-start lg:gap-3 lg:rounded-xl lg:px-4 lg:py-2.5"
        aria-label="Create post"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="hidden text-sm font-bold lg:inline">Create</span>
      </Link>

      <NavBtn href="/explore" icon={<ExploreIcon />} label="Explore" active={active === "explore"} />
      <NavBtn href="/profile" icon={<ProfileIcon />} label="Profile" active={active === "profile"} />
    </nav>
  );
}

function NavBtn({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 px-3 py-1
                 lg:w-full lg:flex-row lg:gap-3 lg:rounded-xl lg:px-4 lg:py-2.5 lg:hover:bg-[#F8F5FF]"
    >
      <span style={{ color: active ? "#6F2DBD" : "#888" }}>{icon}</span>
      <span
        className="text-[10px] font-medium lg:text-sm"
        style={{ color: active ? "#6F2DBD" : "#888" }}
      >
        {label}
      </span>
    </Link>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function InstantIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function ExploreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
