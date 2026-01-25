"use client"

import { CheckCircle } from "lucide-react"

import { ResultsPreview } from "@/components/onboarding/results-preview"
import { ScoreGauge } from "@/components/ui/score-gauge"
import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"

const topIssues = [
  {
    title: "Checkout trust signals missing",
    description: "Add security badges and guarantees to reduce hesitation.",
    severity: "critical" as const,
    impact: "+9% lift",
  },
  {
    title: "Cart upsell placement",
    description: "Move cross-sells above the fold for more visibility.",
    severity: "warning" as const,
    impact: "+6% lift",
  },
  {
    title: "Hero CTA clarity",
    description: "Update button copy to emphasize value quickly.",
    severity: "suggestion" as const,
    impact: "+4% lift",
  },
]

export default function ResultsPage() {
  const score = 72
  const issueCount = 11
  const potentialRevenue = 18420

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full mb-4">
          <CheckCircle className="w-4 h-4" />
          Analysis Complete
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          We found ${potentialRevenue.toLocaleString()} in hidden revenue
        </h1>

        <p className="text-[#9CA3AF]">
          Ghost identified {issueCount} optimization opportunities for
          Northwind Co.
        </p>
      </div>

      <GhostCard className="p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[#9CA3AF] mb-2">Your Store Health Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold text-white">{score}</span>
              <span className="text-2xl text-[#6B7280]">/100</span>
            </div>
            <p className="text-[#FBBF24] mt-2">
              Good, with room to grow
            </p>
          </div>
          <ScoreGauge score={score} size={160} />
        </div>
      </GhostCard>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Top Opportunities
        </h2>
        <ResultsPreview issues={topIssues} />
        <div className="mt-4 text-center text-[#6B7280]">
          + {issueCount - 3} more opportunities
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#FBBF24]/10 to-transparent border border-[#FBBF24]/20 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">
              Unlock all {issueCount} opportunities
            </h3>
            <p className="text-[#9CA3AF]">
              Get detailed fixes, code snippets, and ongoing monitoring
            </p>
          </div>
          <GhostButton className="px-6">Start Free Trial →</GhostButton>
        </div>
      </div>

      <div className="text-center mt-4">
        <button className="text-[#6B7280] hover:text-[#9CA3AF] text-sm">
          Continue with limited access →
        </button>
      </div>
    </div>
  )
}
