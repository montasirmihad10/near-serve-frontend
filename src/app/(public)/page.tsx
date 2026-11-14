import FinalCTA from "@/components/home/FinalCTA";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import LiveActivity from "@/components/home/LiveActivity";
import Testimonials from "@/components/home/Testimonials";
import TrustFeatures from "@/components/home/TrustFeatures";

/** Landing at `/` — uses (public)/layout for Navbar + Footer. */
export default function PublicHomePage() {
  return (
    <div className="bg-cream">
      <Hero />
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cream via-cream to-transparent" />
        <HowItWorks />
      </div>
      <div className="bg-[linear-gradient(180deg,#f7f1e8_0%,#faf6ef_100%)]">
        <LiveActivity />
      </div>
      <TrustFeatures />
      <div className="bg-[linear-gradient(180deg,#faf6ef_0%,#f3ebe0_55%,#faf6ef_100%)]">
        <Testimonials />
      </div>
      <FinalCTA />
    </div>
  );
}
