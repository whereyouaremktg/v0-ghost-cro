"use client"

import { Lightbulb } from "lucide-react"

import { GhostCard } from "@/components/ui/ghost-card"
import { GhostInsightCard } from "@/components/ui/ghost-insight-card"

const insights = [
  {
    title: "Boost mobile conversion",
    description: "Optimize mobile hero spacing to reduce scroll friction.",
    severity: "warning" as const,
    impact: "+6% lift",
  },
  {
    title: "Refine product descriptions",
    description: "Lead with outcome-driven copy to increase add-to-cart.",
    severity: "suggestion" as const,
    impact: "+4% lift",
  },
]

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <GhostCard className="p-6 flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-[#FBBF24]/10 flex items-center justify-center">
          <Lightbulb className="h-6 w-6 text-[#FBBF24]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Insights</h2>
          <p className="text-sm text-[#9CA3AF]">
            Strategic ideas from Ghost to increase revenue.
          </p>
        </div>
      </GhostCard>

      <div className="grid gap-4">
        {insights.map((insight) => (
          <GhostInsightCard key={insight.title} {...insight} />
        ))}
      </div>
    </div>
  )
}
