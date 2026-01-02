"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Play, TrendingDown, Store, Sparkles } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ScoreChart } from "@/components/dashboard/score-chart"
import { RecentTestsTable } from "@/components/dashboard/recent-tests-table"
import { RevenueCalculator } from "@/components/dashboard/revenue-calculator"
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

  const hasTests = (tests?.length || 0) > 0
  const hasScore = (stats.currentScore || 0) > 0

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

  useEffect(() => {
    // Check if Shopify is connected
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
  }, [])

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

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-card border-2 border-border brutal-shadow">
            <Sparkles className="h-5 w-5" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {hasScore ? "Your latest checkout performance and prioritized fixes." : "Run your first scan to generate your checkout report."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {shopifyStore?.shop && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-card border-2 border-border brutal-shadow text-sm">
              <Store className="h-4 w-4" strokeWidth={3} />
              <span className="font-bold">{shopifyStore.shop}</span>
            </div>
          )}

          <Link
            href="/dashboard/run-test"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover"
          >
            <Play className="h-4 w-4" strokeWidth={3} />
            Run New Test
          </Link>
        </div>
      </div>

      {/* Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Primary Score */}
        <div className="bg-card border-2 border-border brutal-shadow p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Ghost Checkout Score</div>
              <div className="flex items-end gap-3">
                <div className="text-5xl font-mono font-bold leading-none">{hasScore ? stats.currentScore : "—"}</div>
                <div className="text-sm text-muted-foreground pb-1">{hasScore ? "/100" : "Run a test"}</div>
              </div>
              {stats.previousScore ? (
                <div className="mt-3 text-sm">
                  <span className={scoreDiff >= 0 ? "text-primary font-bold" : "text-red-500 font-bold"}>
                    {scoreDiff >= 0 ? `+${scoreDiff}` : `${scoreDiff}`}
                  </span>{" "}
                  <span className="text-muted-foreground">vs last test</span>
                </div>
              ) : (
                <div className="mt-3 text-sm text-muted-foreground">We’ll compare your score after your second scan.</div>
              )}
            </div>

            {percentile ? (
              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Benchmark</div>
                <div className="mt-1 text-lg font-bold">{getPercentileLabel(percentile)}</div>
                <div className="text-xs text-muted-foreground">of Shopify stores</div>
              </div>
            ) : (
              <div className="text-right text-xs text-muted-foreground">No benchmark yet</div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between text-sm">
            <div className="text-muted-foreground">Tests this month</div>
            <div className="font-bold">{stats.testsThisMonth}</div>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <div className="text-muted-foreground">Tests remaining</div>
            <div className="font-bold">{stats.testsRemaining}</div>
          </div>
        </div>

        {/* Live Money Leak */}
        <div className="bg-destructive/10 border-2 border-destructive brutal-shadow p-6">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-destructive border-2 border-border flex-shrink-0">
              <TrendingDown className="h-5 w-5 text-destructive-foreground" strokeWidth={3} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-tight">Live Money Leak</h2>
                {loadingMetrics && <span className="text-xs text-muted-foreground">Fetching Shopify metrics…</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Estimated revenue lost due to friction detected in your latest scan.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <div className="bg-background border-2 border-border p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Daily</div>
                  <div className="text-3xl font-mono font-bold text-destructive">
                    {hasScore && revenueLeak.daily > 0 ? `$${revenueLeak.daily.toLocaleString()}` : "—"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background border-2 border-border p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Weekly</div>
                    <div className="text-xl font-mono font-bold text-destructive">
                      {hasScore && revenueLeak.weekly > 0 ? `$${revenueLeak.weekly.toLocaleString()}` : "—"}
                    </div>
                  </div>
                  <div className="bg-background border-2 border-border p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Monthly</div>
                    <div className="text-xl font-mono font-bold text-destructive">
                      {hasScore && revenueLeak.monthly > 0 ? `$${revenueLeak.monthly.toLocaleString()}` : "—"}
                    </div>
                  </div>
                </div>
              </div>

              {!shopifyStore?.shop && (
                <div className="mt-4 text-xs text-muted-foreground">
                  Connect Shopify to improve leak accuracy (sessions, AOV, revenue).
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next Actions */}
        <div className="bg-card border-2 border-border brutal-shadow p-6">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Next Actions</div>
          {!hasScore ? (
            <div className="mt-2">
              <div className="text-lg font-bold mb-2">Run your first scan</div>
              <p className="text-sm text-muted-foreground mb-4">Ghost will mirror a shopper and generate your first report with prioritized fixes.</p>
              <Link
                href="/dashboard/run-test"
                className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover"
              >
                <Play className="h-4 w-4" strokeWidth={3} />
                Start Scan
              </Link>
            </div>
          ) : (
            <div className="mt-2 space-y-3">
              <div className="bg-background border-2 border-border p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">This week</div>
                <div className="mt-1 font-bold">Fix 3 high-impact friction points</div>
                <div className="mt-1 text-sm text-muted-foreground">Start with trust signals + CTA clarity + shipping transparency.</div>
              </div>
              <div className="bg-background border-2 border-border p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Then</div>
                <div className="mt-1 font-bold">Re-run scan to verify lift</div>
                <div className="mt-1 text-sm text-muted-foreground">Ghost tracks score movement and leak reduction.</div>
              </div>
              <div className="text-xs text-muted-foreground">(Auto-generated recommendations coming next.)</div>
            </div>
          )}
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-card border-2 border-border brutal-shadow p-6 mb-8">
        <p className="text-lg">
          <span className="font-bold">{user.name.split(" ")[0]}, here’s what Ghost sees.</span>{" "}
          {hasScore ? (
            <>
              Your checkout score is{" "}
              {scoreDiff >= 0 ? (
                <span className="text-primary font-bold">up {scoreDiff} points</span>
              ) : (
                <span className="text-red-500 font-bold">down {Math.abs(scoreDiff)} points</span>
              )}{" "}
              since your last scan.
            </>
          ) : (
            <>Run your first scan to generate a baseline score and prioritized fixes.</>
          )}
        </p>
        {stats.plan === "free" && (
          <p className="text-sm text-muted-foreground mt-2">
            You&apos;re on the free plan with {stats.testsRemaining} test remaining.{" "}
            <Link href="/#pricing" className="text-primary font-bold underline">
              Upgrade to run more tests
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
                  value: `${scoreDiff >= 0 ? "+" : ""}${scoreDiff} vs last test`,
                  positive: scoreDiff >= 0,
                }
              : undefined
          }
          percentile={percentile ? getPercentileLabel(percentile) : undefined}
        />
        <StatCard
          label="Plan"
          value={stats.plan.charAt(0).toUpperCase() + stats.plan.slice(1)}
          sublabel={stats.plan === "free" ? "1 test included" : `${stats.testsLimit} tests/mo`}
        />
        <StatCard
          label="Tests Run"
          value={stats.testsThisMonth}
          sublabel="this month"
          trend={{
            value: `${stats.testsRemaining} remaining`,
            positive: stats.testsRemaining > 0,
          }}
        />
        <StatCard label="Total Tests" value={tests.length} sublabel="all time" />
      </div>

      {/* Revenue Calculator */}
      <div className="mb-8">
        <RevenueCalculator
          shopifyMetrics={shopifyMetrics}
          shopifyStore={shopifyStore}
          loadingMetrics={loadingMetrics}
        />
      </div>

      {/* Chart + Recent Tests */}
      {hasTests ? (
        <>
          <div className="mb-8">
            <ScoreChart tests={tests} />
          </div>
          <RecentTestsTable tests={tests} />
        </>
      ) : (
        <div className="bg-card border-2 border-border brutal-shadow p-6">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">No scans yet</div>
          <div className="text-lg font-bold mb-2">Run your first Ghost scan</div>
          <p className="text-sm text-muted-foreground mb-4">
            Ghost will analyze your PDP and checkout flow, detect friction, and generate a fix plan.
          </p>
          <Link
            href="/dashboard/run-test"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover"
          >
            <Play className="h-4 w-4" strokeWidth={3} />
            Run First Test
          </Link>
        </div>
      )}
    </div>
  )
}
