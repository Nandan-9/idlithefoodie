"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "../layout/Container";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
<nav className="absolute top-0 left-0 w-full z-50 pt-5 bg-transparent">
          <Container>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/asset2/idli-new.png"
                alt="Idlie Logo"
                width={140}
                height={80}
                className="object-contain w-[110px] sm:w-[140px]"
              />
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={() => router.push("/login")}
                className="bg-[#6D28D9] text-white px-7 py-3 rounded-full font-semibold"
              >
                Sign In
              </button>
            </div>

            <button
              onClick={() => setOpen(true)}
              className="lg:hidden bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-md"
            >
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </Container>
      </nav>

      <MobileMenu open={open} setOpen={setOpen} />
    </>
  );
}