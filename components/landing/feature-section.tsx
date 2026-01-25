'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { Check, ArrowRight, Type, CreditCard, BarChart3, type LucideIcon } from 'lucide-react'

type IconName = 'type' | 'credit-card' | 'bar-chart-3'

const iconMap: Record<IconName, LucideIcon> = {
  'type': Type,
  'credit-card': CreditCard,
  'bar-chart-3': BarChart3,
}

interface FeatureSectionProps {
  icon: IconName
  badge: string
  title: string
  description: string
  checklistItems?: string[]
  link?: { label: string; href: string }
  imageSide: 'left' | 'right'
  imageContent?: React.ReactNode
}

export function FeatureSection({
  icon,
  badge,
  title,
  description,
  checklistItems,
  link,
  imageSide,
  imageContent,
}: FeatureSectionProps) {
  const Icon = iconMap[icon]
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const contentOrder = imageSide === 'left' ? 'lg:order-2' : ''
  const imageOrder = imageSide === 'left' ? 'lg:order-1' : ''

  return (
    <section ref={ref} className="py-24" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: imageSide === 'left' ? 30 : -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className={contentOrder}
          >
            {/* Icon box */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--landing-accent)]/10 border border-[var(--landing-accent)]/20 mb-6">
              <Icon className="w-6 h-6 text-[var(--landing-accent)]" />
            </div>

            {/* Badge - optional subtitle */}
            {badge && (
              <p className="text-sm text-[var(--landing-accent)] font-medium mb-3">
                {badge}
              </p>
            )}

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--landing-text-primary)] mb-4">
              {title}
            </h2>

            {/* Description */}
            <p className="text-lg text-[var(--landing-text-secondary)] mb-6 leading-relaxed">
              {description}
            </p>

            {/* Checklist items */}
            {checklistItems && checklistItems.length > 0 && (
              <ul className="space-y-3 mb-6">
                {checklistItems.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 text-[var(--landing-text-secondary)]"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--landing-accent)]/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-[var(--landing-accent)]" />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
            )}

            {/* Link */}
            {link && (
              <a
                href={link.href}
                className="inline-flex items-center gap-2 text-[var(--landing-accent)] hover:underline font-medium"
              >
                {link.label}
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: imageSide === 'left' ? -30 : 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn('relative', imageOrder)}
          >
            <div className="aspect-[4/3] rounded-2xl bg-[var(--landing-surface)] border border-[var(--landing-border)] overflow-hidden">
              {imageContent || (
                <div className="w-full h-full flex items-center justify-center text-[var(--landing-text-muted)]">
                  Feature Image
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
