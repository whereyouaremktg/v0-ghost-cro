"use client"

import { useMemo } from "react"
import {
  CheckCircle,
  DollarSign,
  FlaskConical,
  Zap,
} from "lucide-react"
import { format } from "date-fns"

import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { BenchmarkSection } from "@/components/dashboard/benchmark-section"
import { InsightsPanel } from "@/components/dashboard/insights-panel"
import { ScoreHeroCard } from "@/components/dashboard/score-hero-card"
import { EmptyState } from "@/components/ui/empty-state"
import { GhostButton } from "@/components/ui/ghost-button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCard } from "@/components/ui/stat-card"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useLatestTest } from "@/hooks/use-latest-test"
import type { FrictionPoint, TestResult } from "@/lib/types"

const activities = [
  {
    id: "a1",
    type: "scan" as const,
    title: "Daily scan completed",
    timestamp: "2 hours ago",
  },
  {
    id: "a2",
    type: "fix" as const,
    title: "Fixed product page sticky CTA",
    timestamp: "Yesterday",
  },
  {
    id: "a3",
    type: "alert" as const,
    title: "Checkout speed dropped 12%",
    timestamp: "2 days ago",
  },
]

const mapImpact = (impact?: string) => {
  if (!impact) {
    return 0
  }
  const match = impact.match(/\d+/)
  return match ? Number(match[0]) : 0
}

const buildIssues = (test: TestResult) => {
  const mapIssue = (
    issue: FrictionPoint,
    severity: "critical" | "warning" | "suggestion",
  ) => ({
    id: issue.id,
    title: issue.title,
    description: issue.fix || issue.impact || "",
    category: issue.location || "General",
    severity,
    potentialImpact: mapImpact(issue.impact),
  })

  return [
    ...test.frictionPoints.critical.map((issue) =>
      mapIssue(issue, "critical"),
    ),
    ...test.frictionPoints.high.map((issue) => mapIssue(issue, "warning")),
    ...test.frictionPoints.medium.map((issue) =>
      mapIssue(issue, "suggestion"),
    ),
  ]
}

export default function DashboardPage() {
  const { userId, isLoading: isUserLoading } = useAuthUserId()
  const { test, isLoading } = useLatestTest(userId)

  const issues = useMemo(() => (test ? buildIssues(test) : []), [test])

  const scanDate = test?.date
    ? format(new Date(test.date), "MMM d, yyyy 'at' h:mm a")
    : "--"
  const previousScore = test?.previousScore ?? test?.score ?? 0

  const revenueLeak = (test as { revenueLeak?: number } | null)?.revenueLeak
  const revenueImpactDisplay = revenueLeak
    ? `$${revenueLeak.toLocaleString()}`
    : "—"

  const pageSpeed = test?.storeAnalysis?.technical.pageLoadTime
  const pageSpeedDisplay = pageSpeed ? `${pageSpeed.toFixed(1)}s` : "—"

  const conversionRate = test?.funnelData?.landed
    ? (test.funnelData.purchased / test.funnelData.landed) * 100
    : 0

  if (isUserLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Skeleton className="h-80 xl:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <EmptyState
        icon={FlaskConical}
        title="No completed scans yet"
        description="Run your first scan to see your score and prioritized fixes."
        action={
          <GhostButton asChild>
            <a href="/dashboard/onboarding">Start a scan</a>
          </GhostButton>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <ScoreHeroCard
        score={test.score}
        previousScore={previousScore}
        scanDate={scanDate}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Revenue Impact"
          value={revenueImpactDisplay}
          trend={test.change}
          trendLabel="vs last scan"
          icon={DollarSign}
          index={0}
        />
        <StatCard
          label="Issues Found"
          value={`${test.issuesFound}`}
          trendLabel="in latest scan"
          icon={CheckCircle}
          index={1}
        />
        <StatCard
          label="Active Tests"
          value="1"
          subtitle="latest completed"
          icon={FlaskConical}
          index={2}
        />
        <StatCard
          label="Page Speed"
          value={pageSpeedDisplay}
          trendLabel="estimated"
          trendPositive={pageSpeed ? pageSpeed < 3 : undefined}
          icon={Zap}
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <InsightsPanel issues={issues} />
        </div>
        <div>
          <ActivityFeed activities={activities} />
        </div>
      </div>

      <BenchmarkSection
        storeMetrics={{
          conversionRate,
          aov: 0,
          revenuePerVisitor: 0,
        }}
        industryBenchmarks={{
          conversionRate: 3.1,
          aov: 92,
          revenuePerVisitor: 2.8,
        }}
      />
    </div>
  )
}
