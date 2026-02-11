"use client"

import { useMemo } from "react"
import {
  CheckCircle,
  DollarSign,
  FlaskConical,
  Zap,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import useSWR from "swr"

import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { InsightsPanel } from "@/components/dashboard/insights-panel"
import { ScoreHeroCard } from "@/components/dashboard/score-hero-card"
import { EmptyState } from "@/components/ui/empty-state"
import { GhostButton } from "@/components/ui/ghost-button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCard } from "@/components/ui/stat-card"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useLatestTest } from "@/hooks/use-latest-test"
import { useTestHistory } from "@/hooks/use-test-history"
import { getCategoryBenchmarks } from "@/lib/data/benchmarks"
import { createClient } from "@/lib/supabase/client"
import type { FrictionPoint, TestResult } from "@/lib/types"

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

type StoreIntelligenceRow = {
  industry: string | null
  estimated_sales_monthly: number | null
  estimated_traffic_monthly: number | null
}

function getDomainFromUrl(url?: string | null): string | null {
  if (!url) {
    return null
  }

  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`)
    return parsed.hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    return null
  }
}

function formatStoreMetric(
  value: number | null,
  options: { prefix?: string; suffix?: string; decimals?: number } = {},
): string {
  if (value === null || Number.isNaN(value)) {
    return "No data yet"
  }

  const { prefix = "", suffix = "", decimals = 1 } = options
  return `${prefix}${value.toFixed(decimals)}${suffix}`
}

export default function DashboardPage() {
  const { userId, isLoading: isUserLoading } = useAuthUserId()
  const { test, isLoading } = useLatestTest(userId)
  const { tests: testHistory } = useTestHistory(userId, 5)
  const storeDomain = useMemo(() => getDomainFromUrl(test?.url), [test?.url])

  const { data: storeIntelligence } = useSWR(
    storeDomain ? ["store-intelligence", storeDomain] : null,
    async (): Promise<StoreIntelligenceRow | null> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("store_intelligence")
        .select("industry, estimated_sales_monthly, estimated_traffic_monthly")
        .eq("domain", storeDomain!)
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      return (data as StoreIntelligenceRow | null) ?? null
    },
  )

  const issues = useMemo(() => (test ? buildIssues(test) : []), [test])

  // Build activities from test history
  const activities = useMemo(() => {
    return testHistory.map((t) => {
      const isCompleted = t.status === "completed"
      const isFailed = t.status === "failed"

      return {
        id: t.id,
        type: isFailed ? "alert" as const : "scan" as const,
        title: isCompleted
          ? `Scan completed${t.overall_score ? ` - Score: ${t.overall_score}` : ''}`
          : isFailed
            ? "Scan failed"
            : "Scan in progress",
        timestamp: t.created_at
          ? formatDistanceToNow(new Date(t.created_at), { addSuffix: true })
          : "Unknown",
      }
    })
  }, [testHistory])

  // Count completed tests
  const completedTestsCount = testHistory.filter(t => t.status === "completed").length

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

  const conversionRate =
    test?.funnelData?.landed && test.funnelData.landed > 0
      ? (test.funnelData.purchased / test.funnelData.landed) * 100
      : null
  const revenuePerVisitor =
    storeIntelligence?.estimated_sales_monthly !== null &&
    storeIntelligence?.estimated_sales_monthly !== undefined &&
    storeIntelligence?.estimated_traffic_monthly !== null &&
    storeIntelligence?.estimated_traffic_monthly !== undefined &&
    storeIntelligence.estimated_traffic_monthly > 0
      ? Number(storeIntelligence.estimated_sales_monthly) /
        Number(storeIntelligence.estimated_traffic_monthly)
      : null
  const industryBenchmarks = getCategoryBenchmarks(storeIntelligence?.industry)

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
            <a href="/dashboard/scanner">Start a scan</a>
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
          label="Completed Scans"
          value={`${completedTestsCount}`}
          subtitle="total scans"
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

      <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Industry Benchmarks</h2>
            <p className="text-sm text-[#9CA3AF]">
              Compare your store against top {industryBenchmarks.categoryName} performers.
            </p>
          </div>
          <span className="text-xs text-[#6B7280]">Live data</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-4">
            <p className="text-sm text-[#9CA3AF]">Conversion Rate</p>
            <p className="text-2xl font-semibold text-white">
              {formatStoreMetric(conversionRate, { suffix: "%" })}
            </p>
            <p className="text-xs text-[#6B7280]">
              Benchmark: {(industryBenchmarks.avgConversionRate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-4">
            <p className="text-sm text-[#9CA3AF]">Average Order Value</p>
            <p className="text-2xl font-semibold text-white">
              {formatStoreMetric(null, { prefix: "$", decimals: 2 })}
            </p>
            <p className="text-xs text-[#6B7280]">
              Benchmark: ${industryBenchmarks.avgAOV.toFixed(0)}
            </p>
          </div>
          <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-4">
            <p className="text-sm text-[#9CA3AF]">Revenue per Visitor</p>
            <p className="text-2xl font-semibold text-white">
              {formatStoreMetric(revenuePerVisitor, { prefix: "$", decimals: 2 })}
            </p>
            <p className="text-xs text-[#6B7280]">
              Benchmark: $
              {industryBenchmarks.avgAOV > 0
                ? (industryBenchmarks.avgAOV * industryBenchmarks.avgConversionRate).toFixed(2)
                : "0.00"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
