'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { GhostButton } from '@/components/ui/ghost-button'
import { GhostLogo } from '@/components/ghost-logo'

export function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--landing-accent)]/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Large Ghost Logo */}
          <div className="mb-8 flex justify-center">
            <GhostLogo size="lg" animated />
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--landing-text-primary)] mb-6 leading-tight">
            Stop leaving money
            <br />
            <span className="text-gradient-amber">on the table.</span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg text-[var(--landing-text-secondary)] mb-10 max-w-2xl mx-auto">
            Join 500+ Shopify Plus merchants using GhostCRO to optimize their funnel silently.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <GhostButton size="lg" asChild>
              <Link href="/signup">Install GhostCRO</Link>
            </GhostButton>
            <GhostButton variant="outline" size="lg">
              Talk to Sales
            </GhostButton>
          </div>

          {/* Fine print */}
          <p className="text-sm text-[var(--landing-text-muted)]">
            14-day free trial &bull; No code required &bull; Works with Shopify 2.0
          </p>
        </motion.div>
      </div>
    </section>
  )
}
