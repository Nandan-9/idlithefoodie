import { Pizza, IceCreamCone, Flame } from "lucide-react";

export default function FloatingDoodles() {
  return (
    <>
      <Pizza
        className="absolute left-8 top-16 h-9 w-9 -rotate-12 text-[#fedc19]/25"
        strokeWidth={1.5}
      />
      <IceCreamCone
        className="absolute right-10 top-1/4 h-8 w-8 rotate-12 text-[#8b5cf6]/30"
        strokeWidth={1.5}
      />
      <Flame
        className="absolute bottom-16 left-14 h-9 w-9 text-[#fedc19]/25"
        strokeWidth={1.5}
      />
    </>
  );
}
