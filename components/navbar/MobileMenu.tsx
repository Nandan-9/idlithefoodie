"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { navLinks } from "@/lib/constants";

interface MobileMenuProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export default function MobileMenu({
  open,
  setOpen,
}: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-[#6D28D9] text-white"
        >
          <div className="flex items-center justify-between p-6">
            <h2 className="text-3xl font-black">Idlie</h2>

            <button onClick={() => setOpen(false)}>
              <X className="w-9 h-9" />
            </button>
          </div>

          <div className="flex flex-col gap-8 px-6 pt-20">
            {navLinks.map((item) => (
              <button
                key={item}
                className="text-left text-4xl font-black"
              >
                {item}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}