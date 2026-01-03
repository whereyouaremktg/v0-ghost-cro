"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Play, TrendingDown, Store, Sparkles, ArrowRight, Check, Loader2, Clock, Target } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ScoreChart } from "@/components/dashboard/score-chart"
import { GhostTimeline } from "@/components/dashboard/ghost-timeline"
import { RevenueCalculator } from "@/components/dashboard/revenue-calculator"
import { AIInsightPanel } from "@/components/dashboard/ai-insight-panel"
import { CircularScore } from "@/components/dashboard/circular-score"
import { ConnectShopifyGate } from "@/components/dashboard/connect-shopify-gate"
import { PersonaSelector } from "@/components/dashboard/persona-selector"
import { calculateRevenueLeak, calculatePercentileBenchmark, getPercentileLabel } from "@/lib/ghostEngine"
import { saveTestResult, getTestResult } from "@/lib/client-storage"
import type { TestResult } from "@/lib/types"

type ViewMode = "overview" | "timeline" | "simulation"
type TestState = "idle" | "running" | "complete"

interface ProgressStep {
  label: string
  status: "done" | "current" | "pending"
}

interface ShopifyStore {
  shop: string
  accessToken: string
  connectedAt: string
}

interface GhostOSProps {
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

export function GhostOS({ user, stats, tests, latestTestResult }: GhostOSProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<ViewMode>("overview")
  const [shopifyMetrics, setShopifyMetrics] = useState<any>(null)
  const [shopifyStore, setShopifyStore] = useState<ShopifyStore | null>(null)
  const [loadingMetrics, setLoadingMetrics] = useState(false)
  const [isCheckingConnection, setIsCheckingConnection] = useState(true)
  
  // Simulation state
  const [persona, setPersona] = useState("balanced")
  const [comparePrevious, setComparePrevious] = useState(true)
  const [emailOnComplete, setEmailOnComplete] = useState(false)
  const [testState, setTestState] = useState<TestState>("idle")
  const [steps, setSteps] = useState<ProgressStep[]>([
    { label: "Analyzing cart → checkout flow", status: "pending" },
    { label: "Identifying friction points", status: "pending" },
    { label: "Running synthetic shoppers", status: "pending" },
    { label: "Generating recommendations", status: "pending" },
  ])

  const hasTests = (tests?.length || 0) > 0
  const hasScore = (stats.currentScore || 0) > 0

  // Check URL hash or query params for view mode
  useEffect(() => {
    const updateView = () => {
      const hash = window.location.hash.replace("#", "")
      const view = searchParams.get("view")
      
      if (hash === "timeline" || view === "timeline") {
        setViewMode("timeline")
      } else if (hash === "simulation" || view === "simulation") {
        setViewMode("simulation")
      } else {
        setViewMode("overview")
      }
    }
    
    updateView()
    window.addEventListener("hashchange", updateView)
    return () => window.removeEventListener("hashchange", updateView)
  }, [searchParams])

  // Check for Shopify connection on mount
  useEffect(() => {
    const stored = localStorage.getItem("shopifyStore")
    if (stored) {
      try {
        const store = JSON.parse(stored)
        setShopifyStore(store)
        fetchShopifyMetrics(store)
        
        // Auto-trigger simulation if coming from OAuth callback
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get("auto") === "true" && testState === "idle") {
          setViewMode("simulation")
          setTimeout(() => {
            const form = document.querySelector("form")
            if (form) {
              form.requestSubmit()
            }
          }, 500)
        }
      } catch (error) {
        console.error("Failed to parse shopify store data:", error)
      }
    }
    setIsCheckingConnection(false)
  }, [testState])

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

  const handleSimulationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopifyStore) return

    setTestState("running")

    // Build store URL from shop name
    const storeUrl = `https://${shopifyStore.shop}`

    // Start progress animation
    const stepTimings = [1000, 2000, 3000, 4500]
    stepTimings.forEach((timing, index) => {
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((step, i) => ({
            ...step,
            status: i < index ? "done" : i === index ? "current" : "pending",
          })),
        )
      }, timing)
    })

    try {
      // Call the analyze API
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: storeUrl,
          personaMix: persona,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `Analysis failed with status ${response.status}`)
      }

      const responseData = await response.json()
      console.log("Analysis response:", responseData)
      
      if (!responseData.result) {
        throw new Error("No result returned from analysis API")
      }

      const { result } = responseData
      console.log("Saving test result with ID:", result.id)

      // Save the result to localStorage
      saveTestResult(result)
      
      // Verify it was saved
      const saved = getTestResult(result.id)
      console.log("Test result saved:", saved ? "Yes" : "No")
      
      if (!saved) {
        throw new Error("Failed to save test result to localStorage")
      }

      // Complete and redirect
      setSteps((prev) => prev.map((step => ({ ...step, status: "done" as const }))))
      setTestState("complete")
      setTimeout(() => {
        console.log("Redirecting to:", `/ghost/test/${result.id}`)
        router.push(`/ghost/test/${result.id}`)
      }, 500)
    } catch (error) {
      console.error("Simulation failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to run simulation: ${errorMessage}\n\nPlease check:\n1. Your ANTHROPIC_API_KEY is set in .env.local\n2. Your internet connection\n3. Try again in a moment`)
      setTestState("idle")
      setSteps([
        { label: "Analyzing cart → checkout flow", status: "pending" },
        { label: "Identifying friction points", status: "pending" },
        { label: "Running synthetic shoppers", status: "pending" },
        { label: "Generating recommendations", status: "pending" },
      ])
    }
  }

  const scoreDiff = stats.currentScore - stats.previousScore

  // Show loading state while checking connection
  if (isCheckingConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  // Show connect gate if Shopify is not connected
  if (!shopifyStore) {
    return <ConnectShopifyGate />
  }

  // Show simulation running/complete state
  if (viewMode === "simulation" && testState !== "idle") {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-card border border-border/50 rounded-xl shadow-lg p-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 border border-primary/30 rounded-xl">
              <Sparkles className="h-5 w-5 text-primary" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">
              {testState === "complete" ? "Simulation Complete" : "Running Simulation..."}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Store className="h-4 w-4" strokeWidth={2.5} />
            <span>{shopifyStore.shop}</span>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div
                  className={`h-6 w-6 flex items-center justify-center border-2 border-border ${
                    step.status === "done" ? "bg-primary" : step.status === "current" ? "bg-chart-5" : "bg-card"
                  }`}
                >
                  {step.status === "done" ? (
                    <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
                  ) : step.status === "current" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                </div>
                <span
                  className={`text-sm ${
                    step.status === "done"
                      ? "text-foreground"
                      : step.status === "current"
                        ? "text-foreground font-bold"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {testState === "running" && (
            <p className="text-xs text-muted-foreground mt-8">Estimated time remaining: ~1 min</p>
          )}
        </div>
      </div>
    )
  }

  // Main unified Ghost OS view
  return (
    <div className="p-6 lg:p-10">
      {/* View Mode Tabs */}
      <div className="mb-8 flex items-center gap-2 border-b border-border/30 pb-4">
        <button
          onClick={() => {
            setViewMode("overview")
            window.history.replaceState(null, "", "/ghost")
          }}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            viewMode === "overview"
              ? "bg-primary/20 text-primary border border-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Target className="h-4 w-4 inline mr-2" strokeWidth={2.5} />
          Mission Control
        </button>
        <button
          onClick={() => {
            setViewMode("timeline")
            window.history.replaceState(null, "", "/ghost#timeline")
          }}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            viewMode === "timeline"
              ? "bg-primary/20 text-primary border border-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" strokeWidth={2.5} />
          Timeline
        </button>
        <button
          onClick={() => {
            setViewMode("simulation")
            window.history.replaceState(null, "", "/ghost#simulation")
          }}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            viewMode === "simulation"
              ? "bg-primary/20 text-primary border border-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Play className="h-4 w-4 inline mr-2" strokeWidth={2.5} />
          Re-run Simulation
        </button>
      </div>

      {/* Overview View */}
      {viewMode === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-2 space-y-8">
          {/* Hero: Live Money Leak */}
          <div className="bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent border border-destructive/20 rounded-xl shadow-lg p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-destructive" strokeWidth={2.5} />
                  <span className="text-xs font-medium tracking-wide text-muted-foreground/80 uppercase">
                    Live Money Leak
                  </span>
                </div>
                <div className="text-5xl font-heading font-bold text-destructive leading-none mb-2">
                  {hasScore && revenueLeak.monthly > 0 ? `$${revenueLeak.monthly.toLocaleString()}` : "—"}
                </div>
                <div className="text-sm text-muted-foreground/70">per month</div>
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
          <div>
            <RevenueCalculator
              shopifyMetrics={shopifyMetrics}
              shopifyStore={shopifyStore}
              loadingMetrics={loadingMetrics}
            />
          </div>

          {/* Chart */}
          {hasTests && (
            <div>
              <ScoreChart tests={tests} />
            </div>
          )}
          </div>
          
          {/* Desktop: AI Panel on right */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6">
              <AIInsightPanel latestTestResult={latestTestResult} revenueLeak={revenueLeak} />
            </div>
          </div>
        </div>
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <div className="animate-fade-in">
          <GhostTimeline tests={tests} shopifyMetrics={shopifyMetrics} />
        </div>
      )}

      {/* Simulation View */}
      {viewMode === "simulation" && testState === "idle" && (
        <div className="max-w-3xl mx-auto animate-fade-in">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-primary/10 border border-primary/30 rounded-xl">
                <Sparkles className="h-5 w-5 text-primary" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Re-run Simulation</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Run Ghost against your connected Shopify store</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card/40 border border-border/30 rounded-lg text-sm">
              <Store className="h-4 w-4 text-primary" strokeWidth={2.5} />
              <span className="font-medium">{shopifyStore.shop}</span>
            </div>
          </div>

          <form onSubmit={handleSimulationSubmit}>
            <div className="bg-card border border-border/50 rounded-xl shadow-lg p-8">
              {/* Store Info */}
              <div className="mb-6 p-4 bg-background/50 border border-border/30 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Store className="h-4 w-4 text-primary" strokeWidth={2.5} />
                  <span className="text-sm font-medium">Connected Store</span>
                </div>
                <p className="text-sm text-muted-foreground">{shopifyStore.shop}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Ghost will re-run the simulation against your connected store
                </p>
              </div>

              {/* Persona Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium tracking-wide mb-3">Select Persona Mix</label>
                <PersonaSelector selected={persona} onSelect={setPersona} />
              </div>

              {/* Options */}
              <div className="mb-6 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`h-5 w-5 border border-border/50 flex items-center justify-center rounded-sm ${
                      comparePrevious ? "bg-primary" : "bg-card"
                    }`}
                    onClick={() => setComparePrevious(!comparePrevious)}
                  >
                    {comparePrevious && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    checked={comparePrevious}
                    onChange={(e) => setComparePrevious(e.target.checked)}
                    className="sr-only"
                  />
                  <span className="text-sm">Compare to previous scan</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`h-5 w-5 border border-border/50 flex items-center justify-center rounded-sm ${
                      emailOnComplete ? "bg-primary" : "bg-card"
                    }`}
                    onClick={() => setEmailOnComplete(!emailOnComplete)}
                  >
                    {emailOnComplete && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    checked={emailOnComplete}
                    onChange={(e) => setEmailOnComplete(e.target.checked)}
                    className="sr-only"
                  />
                  <span className="text-sm">Email me when complete</span>
                </label>
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium tracking-wide rounded-xl accent-glow transition-all duration-300 hover:-translate-y-1 text-sm"
                >
                  Re-run Simulation
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </button>
                <p className="text-xs text-muted-foreground mt-3">
                  Estimated time: ~2 minutes • Ghost will analyze your entire checkout flow
                </p>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}

