'use client'

import {
  Navbar,
  Hero,
  TrustBar,
  FeatureSection,
  CTASection,
  Footer,
} from '@/components/landing'

export default function LandingPage() {
  return (
    <div className="landing-theme min-h-screen bg-[var(--landing-bg)]">
      <Navbar />
      <Hero />
      <TrustBar />

      {/* Feature Section 1: Typography */}
      <FeatureSection
        icon="type"
        badge="Typography Intelligence"
        title="Typography that converts."
        description="Micro-adjustments in font size, line-height, and hierarchy that compound into meaningful conversion lifts. Our AI spots what the human eye misses."
        checklistItems={[
          'Dynamic font scaling based on device',
          'Contrast ratio optimization',
          'Header hierarchy testing',
        ]}
        imageSide="right"
      />

      {/* Feature Section 2: Checkout */}
      <FeatureSection
        icon="credit-card"
        badge="Checkout Intelligence"
        title="Frictionless checkout."
        description="The most critical point in your funnel deserves the most attention. We analyze every element that could cause a customer to abandon their cart."
        link={{ label: 'Explore Checkout Intelligence', href: '#checkout' }}
        imageSide="left"
      />

      {/* Feature Section 3: Merchandising */}
      <FeatureSection
        icon="bar-chart-3"
        badge="A/B Testing"
        title="Data-driven merchandising."
        description="Stop guessing which product image works best. Our AI tests visual variations and surfaces the winners before you even know there's a problem."
        checklistItems={[
          'Product image A/B testing',
          'Layout optimization',
          'Price display experiments',
        ]}
        imageSide="right"
      />

      <CTASection />
      <Footer />
    </div>
  )
}
