'use client'

import { motion } from 'framer-motion'

const brands = ['VOGUE', 'ESSENTIALS', 'HYPEBEAST', 'LUMINA', 'SUPPLY']

export function TrustBar() {
  return (
    <section className="py-16 border-y border-[var(--landing-border)]">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs uppercase tracking-widest text-[var(--landing-text-muted)] mb-10">
          Trusted by high-growth merchants
        </p>

        <div className="relative overflow-hidden">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--landing-bg)] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--landing-bg)] to-transparent z-10" />

          {/* Scrolling logos */}
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 25,
                ease: 'linear',
              },
            }}
            className="flex gap-20 items-center"
          >
            {[...brands, ...brands, ...brands, ...brands].map((brand, i) => (
              <div
                key={`${brand}-${i}`}
                className="flex-shrink-0 text-2xl font-bold tracking-tight text-[var(--landing-text-muted)]/40"
              >
                {brand}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
