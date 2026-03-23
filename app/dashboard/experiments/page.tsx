"use client"

import { useState } from "react"
import { FlaskConical, Bell, Check, Sparkles, Target, TrendingUp } from "lucide-react"

import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"

const upcomingFeatures = [
  {
    icon: Target,
    title: "A/B Test Creation",
    description: "Create and launch A/B tests with AI-generated variations",
  },
  {
    icon: TrendingUp,
    title: "Conversion Tracking",
    description: "Track conversion rates and statistical significance in real-time",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    description: "Get AI-powered suggestions for what to test next",
  },
]

export default function ExperimentsPage() {
  const [isNotified, setIsNotified] = useState(false)

  const handleNotifyMe = () => {
    setIsNotified(true)
    // In production, this would call an API to add the user to a waitlist
  }

  return (
    <div className="space-y-6">
      <GhostCard className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-semibold text-white">Experiments</h2>
            <span className="px-2 py-0.5 text-xs rounded-full border border-[var(--ghost-accent-primary)]/40 text-[var(--ghost-accent-primary)]">
              Beta
            </span>
          </div>
          <p className="text-sm text-[var(--ghost-text-muted)]">
            Launch guided A/B tests powered by AI.
          </p>
        </div>
        {isNotified ? (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <Check className="h-4 w-4" />
            You'll be notified when this launches!
          </div>
        ) : (
          <GhostButton variant="secondary" onClick={handleNotifyMe}>
            <Bell className="h-4 w-4" />
            Notify me when ready
          </GhostButton>
        )}
      </GhostCard>

      <GhostCard className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-[var(--ghost-accent-primary)]/10 flex items-center justify-center mx-auto mb-4">
            <FlaskConical className="h-8 w-8 text-[var(--ghost-accent-primary)]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Coming Soon
          </h3>
          <p className="text-[var(--ghost-text-muted)] mb-6">
            We're building a powerful experimentation platform that will help you
            test changes and measure their impact on conversions.
          </p>
        </div>
      </GhostCard>

      <div>
        <h3 className="text-sm font-medium text-[var(--ghost-text-muted)] mb-4 uppercase tracking-wider">
          What to expect
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {upcomingFeatures.map((feature) => (
            <GhostCard key={feature.title} className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-[var(--ghost-bg-elevated)] flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-[var(--ghost-accent-primary)]" />
                </div>
                <div>
                  <p className="text-white font-medium">{feature.title}</p>
                  <p className="text-xs text-[var(--ghost-text-subtle)] mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            </GhostCard>
          ))}
        </div>
      </div>
    </div>
  )
}
