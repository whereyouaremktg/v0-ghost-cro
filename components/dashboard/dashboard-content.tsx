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
        <div className="lg:col-span-3 bg-card/50 border border-border/30 rounded-2xl shadow-sm p-5 animate-fade-in card-hover">
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
          <div className="mt-6 pt-4 border-t border-border/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground/70">Scans this month</span>
              <span className="font-medium">{stats.testsThisMonth}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground/70">Scans remaining</span>
              <span className="font-medium">{stats.testsRemaining}</span>
            </div>
          </div>
        </div>

        {/* Live Money Leak - Dominant Hero Metric - 2 columns */}
        <div className="lg:col-span-9 bg-gradient-to-br from-destructive/15 via-destructive/10 to-destructive/5 border border-destructive/40 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 card-hover animate-fade-in relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent pointer-events-none" />
          
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-destructive/30 border border-destructive/50 rounded-xl backdrop-blur-sm">
                  <TrendingDown className="h-5 w-5 text-destructive" strokeWidth={2.5} />
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
              <div className="bg-background/40 backdrop-blur-sm border border-destructive/20 rounded-xl p-6 shadow-sm">
                <div className="text-xs font-medium tracking-wide text-muted-foreground/80 mb-2 mb-3">Daily Leak</div>
                <div className="text-4xl font-heading font-bold text-destructive leading-none mb-1">
                  {hasScore && revenueLeak.daily > 0 ? `$${revenueLeak.daily.toLocaleString()}` : "—"}
                </div>
                <div className="text-xs text-muted-foreground/60">per day</div>
              </div>
              <div className="bg-background/40 backdrop-blur-sm border border-destructive/20 rounded-xl p-6 shadow-sm">
                <div className="text-xs font-medium tracking-wide text-muted-foreground/80 mb-3">Weekly Leak</div>
                <div className="text-4xl font-heading font-bold text-destructive leading-none mb-1">
                  {hasScore && revenueLeak.weekly > 0 ? `$${revenueLeak.weekly.toLocaleString()}` : "—"}
                </div>
                <div className="text-xs text-muted-foreground/60">per week</div>
              </div>
              <div className="bg-background/40 backdrop-blur-sm border border-destructive/20 rounded-xl p-6 shadow-sm">
                <div className="text-xs font-medium tracking-wide text-muted-foreground/80 mb-3">Monthly Leak</div>
                <div className="text-4xl font-heading font-bold text-destructive leading-none mb-1">
                  {hasScore && revenueLeak.monthly > 0 ? `$${revenueLeak.monthly.toLocaleString()}` : "—"}
                </div>
                <div className="text-xs text-muted-foreground/60">per month</div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-card/40 border border-border/20 rounded-xl shadow-sm p-5 animate-fade-in card-hover">
          <div className="text-[11px] font-medium tracking-wide text-muted-foreground/60 mb-3">Next Actions</div>
          {!hasScore ? (
            <div>
              <div className="text-base font-medium mb-1.5">Ghost is analyzing your store</div>
              <p className="text-xs text-muted-foreground/70 mb-3">Your first checkout analysis is in progress. Results will appear here shortly.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="bg-background/30 border border-border/10 rounded-md p-3">
                <div className="text-[10px] font-medium tracking-wide text-muted-foreground/60">This week</div>
                <div className="mt-1 text-sm font-medium">Fix 3 high-impact friction points</div>
                <div className="mt-0.5 text-xs text-muted-foreground/70">Trust signals + CTA clarity + shipping transparency</div>
              </div>
              <div className="bg-background/30 border border-border/10 rounded-md p-3">
                <div className="text-[10px] font-medium tracking-wide text-muted-foreground/60">Then</div>
                <div className="mt-1 text-sm font-medium">Re-run scan to verify lift</div>
                <div className="mt-0.5 text-xs text-muted-foreground/70">Track score movement and leak reduction</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Welcome Banner - De-emphasized */}
      <div className="bg-card/40 border border-border/20 rounded-xl shadow-sm p-4 mb-6 animate-fade-in card-hover">
        <p className="text-sm">
          <span className="font-medium">{user.name.split(" ")[0]}, here's what Ghost sees.</span>{" "}
          {hasScore ? (
            <>
              Checkout score is{" "}
              {scoreDiff >= 0 ? (
                <span className="text-primary font-medium">up {scoreDiff} points</span>
              ) : (
                <span className="text-destructive font-medium">down {Math.abs(scoreDiff)} points</span>
              )}{" "}
              since last scan.
            </>
          ) : (
            <>Ghost is analyzing your store. Results will appear here shortly.</>
          )}
        </p>
        {stats.plan === "free" && (
          <p className="text-xs text-muted-foreground/70 mt-1.5">
            Free plan: {stats.testsRemaining} test remaining.{" "}
            <Link href="/#pricing" className="text-primary font-medium underline hover:no-underline">
              Upgrade
            </Link>
          </p>
        )}
      </div>

      {/* Stats Grid - De-emphasized */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
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
