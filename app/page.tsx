import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { LogosTrustBar } from "@/components/logos-trust-bar"
import { ProblemSection } from "@/components/problem-section"
import { HowItWorks } from "@/components/how-it-works"
import { ComparisonSection } from "@/components/comparison-section"
import { ProductDemoSection } from "@/components/product-demo-section"
import { FeaturesSection } from "@/components/features-section"
import { SocialProof } from "@/components/social-proof"
import { PricingSection } from "@/components/pricing-section"
import { FAQSection } from "@/components/faq-section"
import { FinalCTA } from "@/components/final-cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Content */}
      <main className="bg-transparent">
        <Navbar />
        <HeroSection />
        <LogosTrustBar />
        <ProblemSection />
        <HowItWorks />
        <ComparisonSection />
        <ProductDemoSection />
        <FeaturesSection />
        <SocialProof />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  )
}
