"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Scan,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Target,
  ArrowRight,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { calculateRevenueOpportunity } from "@/lib/calculations/revenue-opportunity"
import { getCategoryBenchmarks } from "@/lib/data/benchmarks"
import { formatCurrency, formatNumber, formatRelativeTime } from "@/lib/utils/format"
import type { TestResult } from "@/lib/types"

interface TimelineEvent {
  id: string
  type: "scan" | "leak_change" | "fix_applied" | "alert"
  timestamp: Date
  title: string
  description: string
  icon: LucideIcon
  color: string
  bgColor: string
  borderColor: string
  testId?: string
  score?: number
  scoreChange?: number
  revenueLeak?: number
  previousLeak?: number
}

interface GhostTimelineProps {
  tests: any[]
  shopifyMetrics?: any
}

export function GhostTimeline({ tests, shopifyMetrics }: GhostTimelineProps) {
  const router = useRouter()

  const events = useMemo(() => {
    const timelineEvents: TimelineEvent[] = []

    // Sort tests by date (newest first)
    const sortedTests = [...tests].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    sortedTests.forEach((test, index) => {
      const testDate = new Date(test.created_at)
      const testResult = test.results as TestResult | null

      // Safe score accessor: test.results?.score ?? test.overall_score ?? 0
      const score = testResult?.score ?? test.overall_score ?? 0

      // Add scan event
      if (test.status === "completed" && testResult) {
        const previousTest = sortedTests[index + 1]
        const previousResult = previousTest?.results as TestResult | null
        const previousScore = previousResult?.score ?? previousTest?.overall_score ?? 0
        const scoreChange = previousTest ? score - previousScore : 0

        // Get metrics for revenue calculation
        const monthlyVisitors = shopifyMetrics?.metrics?.totalSessions || 50000
        const aov = shopifyMetrics?.metrics?.averageOrderValue || 85
        const monthlyRevenue = shopifyMetrics?.metrics?.totalRevenue || monthlyVisitors * 0.025 * aov
        
        // Calculate current conversion rate from test results
        const purchaseCount = testResult.personaResults?.filter((p: any) => p.verdict === "purchase").length || 0
        const totalPersonas = testResult.personaResults?.length || 5
        const simulatedConversionRate = purchaseCount / totalPersonas
        // Scale down simulated CR to realistic levels (simulation is 5 personas, real CR is typically 1-3%)
        const currentConversionRate = simulatedConversionRate * 0.1

        // Get category benchmark
        const category = shopifyMetrics?.category || null
        const benchmarks = getCategoryBenchmarks(category)
        const categoryBenchmarkCR = benchmarks.avgConversionRate

        // Calculate revenue opportunity using source of truth
        const revenueOpportunity = calculateRevenueOpportunity({
          monthlyVisitors,
          currentConversionRate,
          aov,
          categoryBenchmarkCR,
        })

        // Use monthlyOpportunity.max as the "Revenue Leak" value
        const revenueLeak = revenueOpportunity.monthlyOpportunity.max

        // Calculate previous leak if available
        let previousLeak: number | null = null
        if (previousResult) {
          const prevPurchaseCount = previousResult.personaResults?.filter((p: any) => p.verdict === "purchase").length || 0
          const prevTotalPersonas = previousResult.personaResults?.length || 5
          const prevSimulatedCR = prevPurchaseCount / prevTotalPersonas
          const prevCurrentCR = prevSimulatedCR * 0.1

          const prevRevenueOpportunity = calculateRevenueOpportunity({
            monthlyVisitors,
            currentConversionRate: prevCurrentCR,
            aov,
            categoryBenchmarkCR,
          })
          previousLeak = prevRevenueOpportunity.monthlyOpportunity.max
        }

        timelineEvents.push({
          id: `scan-${test.id}`,
          type: "scan",
          timestamp: testDate,
          title: "Store Scan Completed",
          description: `Ghost analyzed your store and found ${(testResult.frictionPoints?.critical?.length || 0) + (testResult.frictionPoints?.high?.length || 0) + (testResult.frictionPoints?.medium?.length || 0)} friction points`,
          icon: Scan,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          testId: test.id,
          score,
          scoreChange,
          revenueLeak,
          previousLeak,
        })

        // Add leak change event if significant change
        if (previousLeak !== null && Math.abs(revenueLeak - previousLeak) > 100) {
          const leakChange = revenueLeak - previousLeak
          timelineEvents.push({
            id: `leak-${test.id}`,
            type: "leak_change",
            timestamp: new Date(testDate.getTime() + 1000), // Slightly after scan
            title: leakChange < 0 ? "Revenue Leak Improved" : "Revenue Leak Increased",
            description: `Monthly leak ${leakChange < 0 ? "decreased" : "increased"} by ${formatCurrency(Math.abs(leakChange))}`,
            icon: leakChange < 0 ? TrendingUp : TrendingDown,
            color: leakChange < 0 ? "text-blue-600" : "text-orange-600",
            bgColor: leakChange < 0 ? "bg-blue-50" : "bg-orange-50",
            borderColor: leakChange < 0 ? "border-blue-200" : "border-orange-200",
            testId: test.id,
            revenueLeak,
            previousLeak,
          })
        }

        // Add alert if score dropped significantly
        if (scoreChange < -5) {
          timelineEvents.push({
            id: `alert-${test.id}`,
            type: "alert",
            timestamp: new Date(testDate.getTime() + 2000), // After leak change
            title: "Score Drop Alert",
            description: `Ghost score dropped by ${Math.abs(scoreChange)} points. Review critical friction points.`,
            icon: AlertTriangle,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200",
            testId: test.id,
            score,
            scoreChange,
          })
        }
      } else if (test.status === "running") {
        timelineEvents.push({
          id: `scan-running-${test.id}`,
          type: "scan",
          timestamp: testDate,
          title: "Store Scan Running",
          description: "Ghost is analyzing your store...",
          icon: Clock,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          testId: test.id,
        })
      }

      // Add fix applied events (mock for now - in production, this would come from a fixes table)
      // This is a placeholder - you'd track when users mark fixes as "applied"
      // Only show fix events for completed tests with results
      if (index === 0 && test.status === "completed" && testResult) {
        // Example: Show a fix applied event for the most recent test
        // In production, you'd query a "fixes_applied" table or similar
        timelineEvents.push({
          id: `fix-${test.id}-1`,
          type: "fix_applied",
          timestamp: new Date(testDate.getTime() + 86400000), // 1 day after scan
          title: "Fix Applied: Shipping Transparency",
          description: "Added shipping cost calculator to checkout flow",
          icon: CheckCircle,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          testId: test.id,
        })
      }
    })

    // Sort all events by timestamp (newest first)
    return timelineEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [tests, shopifyMetrics])

  const handleEventClick = (event: TimelineEvent) => {
    if (event.testId) {
      router.push(`/ghost/test/${event.testId}`)
    }
  }

  if (events.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-[16px] p-12 text-center">
        <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold font-heading text-gray-900 mb-2">No Timeline Events</h3>
        <p className="text-sm text-gray-600 mb-6">Run your first simulation to start building your Ghost timeline</p>
        <Link
          href="/ghost#simulation"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors button-glow"
        >
          <Scan className="h-4 w-4" strokeWidth={2} />
          Run First Simulation
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold font-heading text-gray-900 mb-1">Ghost Timeline</h2>
          <p className="text-sm text-gray-600">Track scans, changes, and fixes over time</p>
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const EventIcon = event.icon
            const isClickable = !!event.testId

            return (
              <div
                key={event.id}
                className={`relative flex items-start gap-4 group ${
                  isClickable ? "cursor-pointer" : ""
                }`}
                onClick={() => isClickable && handleEventClick(event)}
              >
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-xl ${event.bgColor} ${event.borderColor} border-2 flex items-center justify-center transition-all duration-300 ${
                      isClickable ? "group-hover:scale-110 group-hover:shadow-md" : ""
                    }`}
                  >
                    <EventIcon className={`h-5 w-5 ${event.color}`} strokeWidth={2.5} />
                  </div>
                </div>

                {/* Event content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <div className="flex-1">
                      <h3
                        className={`text-sm font-semibold font-heading text-gray-900 mb-1 ${
                          isClickable ? "group-hover:text-blue-600 transition-colors" : ""
                        }`}
                      >
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{event.description}</p>
                    </div>
                    {isClickable && (
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                    )}
                  </div>

                  {/* Event metadata */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                      {formatRelativeTime(event.timestamp)}
                    </div>

                    {event.score !== undefined && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-gray-500">Score:</span>
                        <span className="font-semibold text-gray-900">{formatNumber(event.score)}</span>
                        {event.scoreChange !== undefined && event.scoreChange !== 0 && (
                          <span
                            className={`font-medium ${
                              event.scoreChange > 0 ? "text-blue-600" : "text-orange-600"
                            }`}
                          >
                            {event.scoreChange > 0 ? "+" : ""}
                            {formatNumber(event.scoreChange)}
                          </span>
                        )}
                      </div>
                    )}

                    {event.revenueLeak !== undefined && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <DollarSign className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
                        <span className="text-gray-500">Leak:</span>
                        <span className="font-semibold text-orange-600">
                          {formatCurrency(event.revenueLeak)}/mo
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
