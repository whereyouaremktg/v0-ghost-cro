"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Play } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ScoreChart } from "@/components/dashboard/score-chart"
import { RecentTestsTable } from "@/components/dashboard/recent-tests-table"
import { RevenueCalculator } from "@/components/dashboard/revenue-calculator"

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
}

export function DashboardContent({ user, stats, tests }: DashboardContentProps) {
  const [shopifyMetrics, setShopifyMetrics] = useState<any>(null)
  const [shopifyStore, setShopifyStore] = useState<any>(null)
  const [loadingMetrics, setLoadingMetrics] = useState(false)

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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Dashboard</h1>
        <Link
          href="/dashboard/run-test"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover"
        >
          <Play className="h-4 w-4" strokeWidth={3} />
          Run New Test
        </Link>
      </div>

      {/* Welcome Banner */}
      <div className="bg-card border-2 border-border brutal-shadow p-6 mb-8">
        <p className="text-lg">
          <span className="font-bold">Good morning, {user.name.split(" ")[0]}.</span>{" "}
          {stats.currentScore > 0 ? (
            <>
              Your checkout score is{" "}
              {scoreDiff >= 0 ? (
                <span className="text-primary font-bold">up {scoreDiff} points</span>
              ) : (
                <span className="text-red-500 font-bold">down {Math.abs(scoreDiff)} points</span>
              )}{" "}
              since your last test.
            </>
          ) : (
            <>Run your first test to see your checkout score.</>
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

      {/* Chart */}
      <div className="mb-8">
        <ScoreChart tests={tests} />
      </div>

      {/* Recent Tests */}
      <RecentTestsTable tests={tests} />
    </div>
  )
}
