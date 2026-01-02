import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { SocialProof } from "@/components/social-proof"
import { HowItWorks } from "@/components/how-it-works"
import { PricingSection } from "@/components/pricing-section"
import { FAQSection } from "@/components/faq-section"
import { FinalCTA } from "@/components/final-cta"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <SocialProof />
      <HowItWorks />
      <PricingSection />
      <FAQSection />
      <FinalCTA />
    </main>
  )
}
