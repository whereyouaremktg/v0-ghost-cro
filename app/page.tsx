import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { LogosTrustBar } from "@/components/logos-trust-bar"
import { ProblemSection } from "@/components/problem-section"
import { HowItWorks } from "@/components/how-it-works"
import { ProductDemoSection } from "@/components/product-demo-section"
import { FeaturesSection } from "@/components/features-section"
import { SocialProof } from "@/components/social-proof"
import { PricingSection } from "@/components/pricing-section"
import { FAQSection } from "@/components/faq-section"
import { FinalCTA } from "@/components/final-cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-white to-white" />
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-lime-200/30 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
      </div>
      
      {/* Content */}
      <main className="bg-transparent">
        <Navbar />
        <HeroSection />
      <LogosTrustBar />
      <ProblemSection />
      <HowItWorks />
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
