import Hero from "../components/landing/Hero";
import SocialProof from "../components/landing/SocialProof";
import Features from "../components/landing/Features";
import Testimonials from "../components/landing/Testimonials";
import Pricing from "../components/landing/Pricing";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <div style={{ backgroundColor: "var(--theme-bg)", minHeight: "100vh" }}>
      <Hero />
      <SocialProof />
      <Features />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
}

