"use client"

import {
  CheckCircle,
  DollarSign,
  FlaskConical,
  Zap,
} from "lucide-react"

import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { BenchmarkSection } from "@/components/dashboard/benchmark-section"
import { InsightsPanel } from "@/components/dashboard/insights-panel"
import { ScoreHeroCard } from "@/components/dashboard/score-hero-card"
import { StatCard } from "@/components/ui/stat-card"

const latestScan = {
  score: 72,
  previousScore: 66,
  createdAt: "Today at 9:42 AM",
}

const metrics = {
  revenueImpact: 18250,
  revenueImpactTrend: 12,
  issuesFixed: 6,
  issuesFixedTrend: 14,
  activeTests: 3,
  pageSpeed: 2.8,
  pageSpeedTrend: -8,
  conversionRate: 2.4,
  aov: 84,
  revenuePerVisitor: 2.2,
}

const issues = [
  {
    id: "1",
    title: "Checkout CTA lacks urgency",
    description: "Add social proof and urgency indicators near checkout.",
    category: "Checkout",
    severity: "critical" as const,
    potentialImpact: 12,
  },
  {
    id: "2",
    title: "Cart drawer hides recommended add-ons",
    description: "Surface upsells above the fold to increase AOV.",
    category: "AOV",
    severity: "warning" as const,
    potentialImpact: 8,
  },
  {
    id: "3",
    title: "Mobile hero button contrast is low",
    description: "Increase contrast to improve tap-through rate.",
    category: "Mobile",
    severity: "warning" as const,
    potentialImpact: 5,
  },
  {
    id: "4",
    title: "Exit intent offer not configured",
    description: "Deploy a save offer on exit intent popups.",
    category: "Retention",
    severity: "suggestion" as const,
    potentialImpact: 4,
  },
  {
    id: "5",
    title: "Product page speed above 3s",
    description: "Reduce render-blocking apps to improve speed.",
    category: "Performance",
    severity: "critical" as const,
    potentialImpact: 9,
  },
]

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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <ScoreHeroCard
        score={latestScan.score}
        previousScore={latestScan.previousScore}
        scanDate={latestScan.createdAt}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Revenue Impact"
          value={`$${metrics.revenueImpact.toLocaleString()}`}
          trend={metrics.revenueImpactTrend}
          trendLabel="vs last month"
          icon={DollarSign}
          index={0}
        />
        <StatCard
          label="Issues Fixed"
          value={`${metrics.issuesFixed}`}
          trend={metrics.issuesFixedTrend}
          trendLabel="this month"
          icon={CheckCircle}
          index={1}
        />
        <StatCard
          label="Active Tests"
          value={`${metrics.activeTests}`}
          subtitle="2 showing positive"
          icon={FlaskConical}
          index={2}
        />
        <StatCard
          label="Page Speed"
          value={`${metrics.pageSpeed}s`}
          trend={metrics.pageSpeedTrend}
          trendLabel="improvement"
          trendPositive={metrics.pageSpeedTrend < 0}
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
          conversionRate: metrics.conversionRate,
          aov: metrics.aov,
          revenuePerVisitor: metrics.revenuePerVisitor,
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
