"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Play, TrendingDown, Store, Sparkles } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ScoreChart } from "@/components/dashboard/score-chart"
import { RecentTestsTable } from "@/components/dashboard/recent-tests-table"
import { GhostTimeline } from "@/components/dashboard/ghost-timeline"
import { RevenueCalculator } from "@/components/dashboard/revenue-calculator"
import { AIInsightPanel } from "@/components/dashboard/ai-insight-panel"
import { CircularScore } from "@/components/dashboard/circular-score"
import { ConnectShopifyGate } from "@/components/dashboard/connect-shopify-gate"
import { calculateRevenueLeak, calculatePercentileBenchmark, getPercentileLabel } from "@/lib/ghostEngine"
import type { TestResult } from "@/lib/types"

interface DashboardContentProps {
  user: {
    id: string
    email: string
    name: string
  }
  stats: {
    currentScore: number
    previousScore: number
    testsThisMonth: number
    testsRemaining: number
    testsLimit: number
    plan: string
  }
  tests: any[]
  latestTestResult?: TestResult | null
}

export function DashboardContent({ user, stats, tests, latestTestResult }: DashboardContentProps) {
  const [shopifyMetrics, setShopifyMetrics] = useState<any>(null)
  const [shopifyStore, setShopifyStore] = useState<any>(null)
  const [loadingMetrics, setLoadingMetrics] = useState(false)
  const [isCheckingConnection, setIsCheckingConnection] = useState(true)

  const hasTests = (tests?.length || 0) > 0
  const hasScore = (stats.currentScore || 0) > 0

  // Check for Shopify connection on mount
  useEffect(() => {
    const stored = localStorage.getItem("shopifyStore")
    if (stored) {
      try {
        const store = JSON.parse(stored)
        setShopifyStore(store)
        fetchShopifyMetrics(store)
      } catch (error) {
        console.error("Failed to parse shopify store data:", error)
      }
    }
    setIsCheckingConnection(false)
  }, [])

  // Calculate revenue leak using Ghost Engine
  const revenueLeak = useMemo(() => {
    return calculateRevenueLeak(latestTestResult || null, {
      averageOrderValue: shopifyMetrics?.metrics?.averageOrderValue,
      monthlySessions: shopifyMetrics?.metrics?.totalSessions,
      monthlyRevenue: shopifyMetrics?.metrics?.totalRevenue,
    })
  }, [latestTestResult, shopifyMetrics])

  // Calculate percentile benchmark
  const percentile = useMemo(() => {
    if (!stats.currentScore || stats.currentScore === 0) return null
    return calculatePercentileBenchmark(stats.currentScore)
  }, [stats.currentScore])


  const fetchShopifyMetrics = async (store: any) => {
    setLoadingMetrics(true)
    try {
      const response = await fetch("/api/shopify/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop: store.shop,
          accessToken: store.accessToken,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setShopifyMetrics(data)
      }
    } catch (error) {
      console.error("Failed to fetch Shopify metrics:", error)
    } finally {
      setLoadingMetrics(false)
    }
  }

  const scoreDiff = stats.currentScore - stats.previousScore

  // Show connect gate if Shopify is not connected
  if (isCheckingConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!shopifyStore) {
    return <ConnectShopifyGate />
  }

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">
      {/* Mobile: AI Panel at top */}
      <div className="lg:hidden mb-6">
        <div className="h-[400px]">
          <AIInsightPanel latestTestResult={latestTestResult} revenueLeak={revenueLeak} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Main Content */}
        <div>
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-card border border-border/50 rounded-lg shadow-sm">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight font-heading">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {hasScore ? "Your latest checkout performance and prioritized fixes." : "Ghost is analyzing your store checkout flow."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {shopifyStore?.shop && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-card border border-border/50 rounded-md shadow-sm text-sm">
              <Store className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
              <span className="font-medium">{shopifyStore.shop}</span>
            </div>
          )}

          <Link
            href="/ghost#simulation"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium tracking-wide text-sm rounded-xl accent-glow transition-all duration-300 hover:-translate-y-1"
          >
            <Play className="h-4 w-4" strokeWidth={2.5} />
            {hasTests ? "Re-run Simulation" : "Run First Simulation"}
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Compact Circular Score - 1 column */}
        <div className="lg:col-span-3 card-premium p-6 animate-fade-in">
          <CircularScore
            score={stats.currentScore}
            previousScore={stats.previousScore}
            percentile={percentile ? getPercentileLabel(percentile) : null}
            historicalScores={tests
              .filter((t) => t.overall_score !== null)
              .slice(0, 6)
              .map((t) => t.overall_score || 0)
              .reverse()}
          />
          <div className="mt-6 pt-4 border-t border-border/30 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Scans this month</span>
              <span className="font-semibold">{stats.testsThisMonth}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Scans remaining</span>
              <span className="font-semibold">{stats.testsRemaining}</span>
            </div>
          </div>
        </div>

        {/* Live Money Leak - Dominant Hero Metric - 2 columns */}
        <div className="lg:col-span-9 bg-gradient-to-br from-rose-50 via-rose-25 to-white dark:from-rose-950/20 dark:via-rose-950/10 dark:to-background border border-rose-200/50 dark:border-rose-800/30 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-8 card-hover animate-fade-in relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-100/30 to-transparent dark:from-rose-900/10 pointer-events-none" />
          
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-100/50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 rounded-xl backdrop-blur-sm">
                  <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight font-heading">Live Money Leak</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Revenue lost daily due to checkout friction
                  </p>
                </div>
              </div>
              {loadingMetrics && (
                <span className="text-xs text-muted-foreground/70">Fetching metrics…</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-background/40 backdrop-blur-sm border-0 rounded-xl p-8 shadow-sm">
                <p className="metric-label">Daily Leak</p>
                <p className="metric-primary text-leak mt-2">
                  {hasScore && revenueLeak.daily > 0 ? `$${revenueLeak.daily.toLocaleString()}` : "—"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">per day</p>
              </div>
              <div className="bg-background/40 backdrop-blur-sm border-0 rounded-xl p-8 shadow-sm">
                <p className="metric-label">Weekly Leak</p>
                <p className="metric-primary text-leak mt-2">
                  {hasScore && revenueLeak.weekly > 0 ? `$${revenueLeak.weekly.toLocaleString()}` : "—"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">per week</p>
              </div>
              <div className="bg-background/40 backdrop-blur-sm border-0 rounded-xl p-8 shadow-sm">
                <p className="metric-label">Monthly Leak</p>
                <p className="metric-primary text-leak mt-2">
                  {hasScore && revenueLeak.monthly > 0 ? `$${revenueLeak.monthly.toLocaleString()}` : "—"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">per month</p>
              </div>
            </div>

            {!shopifyStore?.shop && (
              <div className="mt-6 text-xs text-muted-foreground/70">
                Connect Shopify to improve leak accuracy with real session and revenue data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Actions - De-emphasized */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card-premium p-6 animate-fade-in">
          <p className="metric-label mb-4">Next Actions</p>
          {!hasScore ? (
            <div>
              <div className="text-base font-medium mb-2">Ghost is analyzing your store</div>
              <p className="text-sm text-muted-foreground">Your first checkout analysis is in progress. Results will appear here shortly.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-muted/30 border-0 rounded-lg p-4">
                <p className="metric-label mb-1">This week</p>
                <p className="text-sm font-medium mb-1">Fix 3 high-impact friction points</p>
                <p className="text-xs text-muted-foreground">Trust signals + CTA clarity + shipping transparency</p>
              </div>
              <div className="bg-muted/30 border-0 rounded-lg p-4">
                <p className="metric-label mb-1">Then</p>
                <p className="text-sm font-medium mb-1">Re-run scan to verify lift</p>
                <p className="text-xs text-muted-foreground">Track score movement and leak reduction</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Welcome Banner - De-emphasized */}
      <div className="card-premium p-5 mb-6 animate-fade-in">
        <p className="text-sm">
          <span className="font-medium">{user.name.split(" ")[0]}, here's what Ghost sees.</span>{" "}
          {hasScore ? (
            <>
              Checkout score is{" "}
              {scoreDiff >= 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">up {scoreDiff} points</span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-medium">down {Math.abs(scoreDiff)} points</span>
              )}{" "}
              since last scan.
            </>
          ) : (
            <>Ghost is analyzing your store. Results will appear here shortly.</>
          )}
        </p>
        {stats.plan === "free" && (
          <p className="text-xs text-muted-foreground mt-2">
            Free plan: {stats.testsRemaining} test remaining.{" "}
            <Link href="/#pricing" className="text-lime-600 dark:text-lime-400 font-medium underline hover:no-underline">
              Upgrade
            </Link>
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Checkout Score"
          value={stats.currentScore || "—"}
          suffix={stats.currentScore ? "/100" : ""}
          trend={
            stats.previousScore
              ? {
                  value: `${scoreDiff >= 0 ? "+" : ""}${scoreDiff} vs last scan`,
                  positive: scoreDiff >= 0,
                }
              : undefined
          }
          percentile={percentile ? getPercentileLabel(percentile) : undefined}
          sparklineData={tests
            .filter((t) => t.overall_score !== null)
            .slice(0, 6)
            .map((t) => t.overall_score || 0)
            .reverse()}
        />
        <StatCard
          label="Plan"
          value={stats.plan.charAt(0).toUpperCase() + stats.plan.slice(1)}
          sublabel={stats.plan === "free" ? "1 test included" : `${stats.testsLimit} tests/mo`}
        />
        <StatCard
          label="Scans Run"
          value={stats.testsThisMonth}
          sublabel="this month"
          trend={{
            value: `${stats.testsRemaining} remaining`,
            positive: stats.testsRemaining > 0,
          }}
        />
        <StatCard label="Total Scans" value={tests.length} sublabel="all time" />
      </div>

      {/* Revenue Calculator */}
      <div className="mb-8">
        <RevenueCalculator
          shopifyMetrics={shopifyMetrics}
          shopifyStore={shopifyStore}
          loadingMetrics={loadingMetrics}
        />
      </div>

      {/* Chart + Ghost Timeline */}
      {hasTests ? (
        <>
          <div className="mb-8">
            <ScoreChart tests={tests} />
          </div>
          <div className="mb-8">
            <GhostTimeline tests={tests} shopifyMetrics={shopifyMetrics} />
          </div>
        </>
      ) : (
        <div className="bg-card/40 border border-border/20 rounded-xl shadow-sm p-6 animate-fade-in card-hover">
          <div className="text-[11px] font-medium tracking-wide text-muted-foreground/60 mb-2">No scans yet</div>
          <div className="text-lg font-semibold mb-2">Ghost is analyzing your store</div>
          <p className="text-sm text-muted-foreground mb-4">
            Your first checkout analysis is in progress. Results will appear here shortly.
          </p>
        </div>
      )}
        </div>

        {/* Desktop: AI Panel on right */}
        <div className="hidden lg:block">
          <div className="sticky top-6 h-[calc(100vh-3rem)]">
            <AIInsightPanel latestTestResult={latestTestResult} revenueLeak={revenueLeak} />
          </div>
        </div>
      </div>
    </div>
  )
}
