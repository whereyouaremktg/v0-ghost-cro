'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { GhostButton } from '@/components/ui/ghost-button'
import { GhostInsightCard } from '@/components/ui/ghost-insight-card'

export function Hero() {
  return (
    <section className="relative min-h-screen pt-20 flex items-center overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 bg-[var(--landing-bg)]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--landing-accent)]/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--landing-accent)]/3 rounded-full blur-[128px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--landing-accent)]/10 border border-[var(--landing-accent)]/20 text-[var(--landing-accent)] text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)] animate-pulse" />
              SILENT OPTIMIZATION AGENT v2.0
            </div>

            {/* Headline - 3 lines */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--landing-text-primary)] leading-[1.1] mb-6">
              Your silent
              <br />
              <span className="amber-underline">CRO engine</span>
              <br />
              for Shopify.
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-[var(--landing-text-secondary)] mb-8 max-w-xl leading-relaxed">
              GhostCRO runs quietly in the background, identifying revenue leaks and
              surfacing optimization opportunities without slowing down your store.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-12">
              <GhostButton size="lg" asChild>
                <Link href="/signup">
                  Connect Shopify Store
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </GhostButton>
              <GhostButton variant="outline" size="lg">
                View Demo Store
              </GhostButton>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4">
              {/* Avatar stack */}
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--landing-surface-hover)] to-[var(--landing-surface)] border-2 border-[var(--landing-bg)] flex items-center justify-center text-xs text-[var(--landing-text-muted)]"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-[var(--landing-text-secondary)]">
                Optimizing <span className="text-[var(--landing-text-primary)] font-semibold">$500M+</span> in GMV
              </p>
            </div>
          </motion.div>

          {/* Right Column - Product Mockup with Insight Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative"
          >
            {/* Browser mockup */}
            <div className="rounded-2xl bg-[var(--landing-surface)] border border-[var(--landing-border)] overflow-hidden shadow-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--landing-border)] bg-[var(--landing-bg)]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-[var(--landing-surface)] rounded-md px-3 py-1.5 text-xs text-[var(--landing-text-muted)]">
                    yourstore.myshopify.com/checkout
                  </div>
                </div>
              </div>

              {/* Browser content - Product grid placeholder */}
              <div className="aspect-[4/3] p-6 bg-[var(--landing-surface)]">
                <div className="grid grid-cols-2 gap-4 h-full">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-[var(--landing-bg)] rounded-lg border border-[var(--landing-border)] flex items-center justify-center"
                    >
                      <div className="text-[var(--landing-text-muted)] text-sm">Product {i}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Ghost Insight Cards */}
            <GhostInsightCard
              title="CTA Color: #000000"
              suggestion="Suggestion: #FBBF24"
              metric="+4.2% Click Rate"
              metricType="positive"
              className="absolute -left-8 top-16 hidden lg:block"
              delay={0.5}
            />

            <GhostInsightCard
              title="Hero Height: 100vh"
              suggestion="Reduce to 85vh"
              metric="+12% Fold Visibility"
              metricType="positive"
              className="absolute -right-4 bottom-32 hidden lg:block"
              delay={0.7}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
