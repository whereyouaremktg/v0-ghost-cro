"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Lightbulb, FlaskConical } from "lucide-react"

import { EmptyState } from "@/components/ui/empty-state"
import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"
import { GhostInsightCard } from "@/components/ui/ghost-insight-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useLatestTest } from "@/hooks/use-latest-test"

export default function InsightsPage() {
  const { userId, isLoading: isUserLoading } = useAuthUserId()
  const { test, isLoading } = useLatestTest(userId)

  // Build insights from test recommendations
  const insights = useMemo(() => {
    if (!test?.recommendations) {
      return []
    }

    return test.recommendations.map((rec, index) => {
      // Map effort to severity
      const severity: "critical" | "warning" | "suggestion" =
        rec.effort === "low" ? "suggestion" :
        rec.effort === "medium" ? "warning" : "critical"

      return {
        id: `insight-${index}`,
        title: rec.title,
        description: rec.description || rec.impact,
        severity,
        impact: rec.impact,
        priority: rec.priority,
        timeEstimate: rec.timeEstimate,
      }
    }).sort((a, b) => a.priority - b.priority)
  }, [test])

  if (isUserLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <EmptyState
        icon={FlaskConical}
        title="No insights yet"
        description="Run a scan to get AI-powered recommendations for your store."
        action={
          <GhostButton asChild>
            <Link href="/dashboard/scanner">Run a scan</Link>
          </GhostButton>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <GhostCard className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-[var(--ghost-accent-primary)]/10 flex items-center justify-center">
            <Lightbulb className="h-6 w-6 text-[var(--ghost-accent-primary)]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI Insights</h2>
            <p className="text-sm text-[var(--ghost-text-muted)]">
              {insights.length} strategic recommendations from your latest scan
            </p>
          </div>
        </div>
        <GhostButton variant="secondary" asChild>
          <Link href="/dashboard/issues">View all issues →</Link>
        </GhostButton>
      </GhostCard>

      {insights.length === 0 ? (
        <GhostCard className="p-8 text-center">
          <p className="text-[var(--ghost-text-subtle)]">
            No recommendations found in your latest scan. Your store is performing well!
          </p>
        </GhostCard>
      ) : (
        <div className="grid gap-4">
          {insights.map((insight) => (
            <GhostInsightCard
              key={insight.id}
              title={insight.title}
              description={insight.description}
              severity={insight.severity}
              impact={insight.impact}
            />
          ))}
        </div>
      )}
    </div>
  )
}
