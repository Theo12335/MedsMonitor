import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import CoreModules from "@/components/CoreModules";
import FacilityManifest from "@/components/FacilityManifest";
import SystemCapabilities from "@/components/SystemCapabilities";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ScrollRevealWrapper from "@/components/ScrollRevealWrapper";

export default function Home() {
  return (
    <ScrollRevealWrapper>
      <main className="min-h-screen bg-[#030712]">
        <Navbar />
        <Hero />
        <Marquee />
        <CoreModules />
        <FacilityManifest />
        <SystemCapabilities />
        <CTASection />
        <Footer />
      </main>
    </ScrollRevealWrapper>
  );
}
