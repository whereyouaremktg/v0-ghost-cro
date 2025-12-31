"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  RefreshCw,
  Share2,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react"
import type { TestResult } from "@/lib/types"

const tabs = ["Overview", "Friction Points", "Shoppers", "Fixes"]

function getScoreColor(score: number) {
  if (score < 50) return "text-destructive"
  if (score < 70) return "text-chart-5"
  return "text-primary"
}

function FrictionCard({
  issue,
  severity,
}: {
  issue: TestResult["frictionPoints"]["critical"][0]
  severity: "critical" | "high" | "medium"
}) {
  const [expanded, setExpanded] = useState(false)
  const borderColors = {
    critical: "border-l-destructive",
    high: "border-l-chart-5",
    medium: "border-l-chart-2",
  }
  const icons = {
    critical: AlertCircle,
    high: AlertTriangle,
    medium: Info,
  }
  const Icon = icons[severity]

  return (
    <div className={`bg-card border-2 border-border border-l-4 ${borderColors[severity]} brutal-shadow`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Icon
            className={`h-5 w-5 mt-0.5 flex-shrink-0 ${severity === "critical" ? "text-destructive" : severity === "high" ? "text-chart-5" : "text-chart-2"}`}
          />
          <div className="flex-1">
            <h4 className="font-bold text-sm">{issue.title}</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              <span>{issue.location}</span>
              <span>{issue.impact}</span>
              <span>{issue.affected}</span>
            </div>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-muted">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
        {expanded && (
          <div className="mt-4 pt-4 border-t-2 border-border">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">How to Fix</p>
            <p className="text-sm">{issue.fix}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PersonaCard({ persona }: { persona: TestResult["personaResults"][0] }) {
  const isAbandoned = persona.verdict === "abandon"
  return (
    <div className="bg-card border-2 border-border brutal-shadow p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-sm">{persona.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{persona.demographics}</p>
        </div>
        <span
          className={`px-3 py-1 text-xs font-bold uppercase tracking-wide border-2 border-border ${
            isAbandoned ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          {isAbandoned ? "Would Abandon" : "Would Purchase"}
        </span>
      </div>
      <p className="text-sm italic text-muted-foreground mb-3">&ldquo;{persona.reasoning}&rdquo;</p>
      {persona.abandonPoint && <p className="text-xs text-destructive font-bold">Left at: {persona.abandonPoint}</p>}
    </div>
  )
}

function RecommendationCard({ rec, index }: { rec: TestResult["recommendations"][0]; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const effortColors = {
    low: "bg-primary text-primary-foreground",
    medium: "bg-chart-5 text-foreground",
    high: "bg-destructive text-destructive-foreground",
  }

  return (
    <div className="bg-card border-2 border-border brutal-shadow">
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-8 w-8 bg-foreground text-background flex items-center justify-center font-mono font-bold text-sm flex-shrink-0">
            {index + 1}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm">{rec.title}</h4>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-bold text-primary">{rec.impact}</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border-2 border-border ${effortColors[rec.effort]}`}
              >
                {rec.effort} Effort
              </span>
            </div>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-muted">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
        {expanded && (
          <div className="mt-4 pt-4 border-t-2 border-border ml-12">
            <p className="text-sm text-muted-foreground">{rec.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TestResultPage({ params }: { params: Promise<{ id: string }> }) {
  const [activeTab, setActiveTab] = useState("Overview")
  const [test, setTest] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTest() {
      try {
        const { id } = await params
        const response = await fetch(`/api/tests/${id}`)

        if (!response.ok) {
          throw new Error("Test not found")
        }

        const { result } = await response.json()
        setTest(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load test")
      } finally {
        setLoading(false)
      }
    }

    loadTest()
  }, [params])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading test results...</p>
        </div>
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "Test not found"}</p>
          <Link
            href="/dashboard/history"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Link>
        </div>
      </div>
    )
  }

  const purchaseRate = Math.round((test.funnelData.purchased / test.funnelData.landed) * 100)
  const purchaseCount = test.personaResults.filter((p) => p.verdict === "purchase").length
  const abandonCount = test.personaResults.filter((p) => p.verdict === "abandon").length

  return (
    <div className="p-8">
      {/* Back Link & Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard/history"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Link>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide border-2 border-border bg-card hover:bg-muted brutal-hover">
            <RefreshCw className="h-4 w-4" />
            Re-run Test
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide border-2 border-border bg-card hover:bg-muted brutal-hover">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-1">{test.url.replace("https://", "")}</h1>
        <p className="text-sm text-muted-foreground">
          {new Date(test.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Score Hero */}
      <div className="bg-card border-2 border-border brutal-shadow p-8 text-center mb-8">
        <div className="flex items-baseline justify-center gap-2">
          <span className={`text-8xl font-mono font-bold ${getScoreColor(test.score)}`}>{test.score}</span>
          <span className="text-2xl text-muted-foreground">/100</span>
        </div>
        <p className="text-primary font-bold mt-2">↑ {test.change} points from previous test</p>
        <p className="text-sm text-muted-foreground mt-1">Industry average: 71</p>
      </div>

      {/* Tabs */}
      <div className="flex border-2 border-border mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-6 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-colors ${
              activeTab === tab ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Overview" && (
        <div className="space-y-8">
          {/* Funnel */}
          <div className="bg-card border-2 border-border brutal-shadow p-6">
            <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-6">Conversion Funnel</h3>
            <div className="flex items-end justify-between gap-2 h-48">
              {Object.entries(test.funnelData).map(([stage, count], index) => {
                const height = (count / test.funnelData.landed) * 100
                const prevCount = index > 0 ? Object.values(test.funnelData)[index - 1] : count
                const dropoff = Math.round(((prevCount - count) / prevCount) * 100)
                return (
                  <div key={stage} className="flex-1 flex flex-col items-center">
                    <div className="w-full relative" style={{ height: `${height}%` }}>
                      <div className="absolute inset-0 bg-primary border-2 border-border" />
                    </div>
                    <div className="mt-3 text-center">
                      <div className="font-mono font-bold">{count}</div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">{stage}</div>
                      {index > 0 && dropoff > 0 && (
                        <div className="text-xs text-destructive font-bold mt-1">-{dropoff}%</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border-2 border-border brutal-shadow p-6">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Would Purchase</div>
              <div className="text-3xl font-mono font-bold text-primary">{purchaseRate}%</div>
            </div>
            <div className="bg-card border-2 border-border brutal-shadow p-6">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                Abandon at Shipping
              </div>
              <div className="text-3xl font-mono font-bold text-destructive">21%</div>
            </div>
            <div className="bg-card border-2 border-border brutal-shadow p-6">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                Abandon at Payment
              </div>
              <div className="text-3xl font-mono font-bold text-chart-5">12%</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Friction Points" && (
        <div className="space-y-8">
          {/* Critical */}
          {test.frictionPoints.critical.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-destructive mb-4">Critical Issues</h3>
              <div className="space-y-4">
                {test.frictionPoints.critical.map((issue) => (
                  <FrictionCard key={issue.id} issue={issue} severity="critical" />
                ))}
              </div>
            </div>
          )}

          {/* High Priority */}
          {test.frictionPoints.high.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-chart-5 mb-4">High Priority</h3>
              <div className="space-y-4">
                {test.frictionPoints.high.map((issue) => (
                  <FrictionCard key={issue.id} issue={issue} severity="high" />
                ))}
              </div>
            </div>
          )}

          {/* Medium Priority */}
          {test.frictionPoints.medium.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-chart-2 mb-4">Medium Priority</h3>
              <div className="space-y-4">
                {test.frictionPoints.medium.map((issue) => (
                  <FrictionCard key={issue.id} issue={issue} severity="medium" />
                ))}
              </div>
            </div>
          )}

          {/* Working Well */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-primary mb-4">Working Well</h3>
            <div className="bg-card border-2 border-border border-l-4 border-l-primary brutal-shadow p-4">
              <ul className="space-y-2">
                {test.frictionPoints.working.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Shoppers" && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Synthetic Shopper Feedback
            </h3>
            <div className="flex items-center gap-2">
              {Array.from({ length: purchaseCount }).map((_, i) => (
                <div key={`purchase-${i}`} className="h-4 w-4 bg-primary border-2 border-border" />
              ))}
              {Array.from({ length: abandonCount }).map((_, i) => (
                <div key={`abandon-${i}`} className="h-4 w-4 bg-destructive border-2 border-border" />
              ))}
              <span className="text-xs text-muted-foreground ml-2">
                {purchaseCount} of {test.personaResults.length} would purchase
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {test.personaResults.map((persona) => (
              <PersonaCard key={persona.id} persona={persona} />
            ))}
          </div>
        </div>
      )}

      {activeTab === "Fixes" && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-6">Recommended Fixes</h3>
          <div className="space-y-4 mb-8">
            {test.recommendations.map((rec, index) => (
              <RecommendationCard key={index} rec={rec} index={index} />
            ))}
          </div>

          {/* Total Impact */}
          <div className="bg-primary border-2 border-border brutal-shadow p-6">
            <div className="text-xs font-bold uppercase tracking-wide text-primary-foreground/80 mb-2">
              Total Potential Impact
            </div>
            <div className="text-3xl font-mono font-bold text-primary-foreground">$8,420/mo recovered</div>
          </div>
        </div>
      )}
    </div>
  )
}
