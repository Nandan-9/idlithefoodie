import Image from "next/image";

export default function HeroContent() {
  return (

    <div>
    <div className="max-w-[620px] pt-10 lg:pt-0">
      <Image
        src="/asset2/good-food.png"
        alt="Good Food"
        width={620}
        height={700}
        className="w-full h-auto object-contain"
      />
    </div>
    
    </div>


    
  );
}