// import Navbar from "./    components/navbar/Navbar";
import Navbar from "@/components/navbar/Navbar";
import Hero from "@/components/hero/Hero";

export default function HomeView() {
  return (
    <main className="overflow-hidden bg-[#ffffff] min-h-screen">
      <Navbar/>
      <Hero />
    </main>
  );
}
