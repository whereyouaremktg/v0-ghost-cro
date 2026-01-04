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
import { calculateRevenueLeak } from "@/lib/ghostEngine"
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

      // Add scan event
      if (test.status === "completed" && testResult) {
        const previousTest = sortedTests[index + 1]
        const previousResult = previousTest?.results as TestResult | null
        const scoreChange = previousTest
          ? (test.overall_score || 0) - (previousTest.overall_score || 0)
          : 0

        const revenueLeak = calculateRevenueLeak(testResult, {
          averageOrderValue: shopifyMetrics?.metrics?.averageOrderValue,
          monthlySessions: shopifyMetrics?.metrics?.totalSessions,
          monthlyRevenue: shopifyMetrics?.metrics?.totalRevenue,
        })

        const previousLeak = previousResult
          ? calculateRevenueLeak(previousResult, {
              averageOrderValue: shopifyMetrics?.metrics?.averageOrderValue,
              monthlySessions: shopifyMetrics?.metrics?.totalSessions,
              monthlyRevenue: shopifyMetrics?.metrics?.totalRevenue,
            })
          : null

        timelineEvents.push({
          id: `scan-${test.id}`,
          type: "scan",
          timestamp: testDate,
          title: "Store Scan Completed",
          description: `Ghost analyzed your store and found ${testResult.frictionPoints.critical.length + testResult.frictionPoints.high.length + testResult.frictionPoints.medium.length} friction points`,
          icon: Scan,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          testId: test.id,
          score: test.overall_score || 0,
          scoreChange,
          revenueLeak: revenueLeak.monthly,
          previousLeak: previousLeak?.monthly || null,
        })

        // Add leak change event if significant change
        if (previousLeak && Math.abs(revenueLeak.monthly - previousLeak.monthly) > 100) {
          const leakChange = revenueLeak.monthly - previousLeak.monthly
          timelineEvents.push({
            id: `leak-${test.id}`,
            type: "leak_change",
            timestamp: new Date(testDate.getTime() + 1000), // Slightly after scan
            title: leakChange < 0 ? "Revenue Leak Improved" : "Revenue Leak Increased",
            description: `Monthly leak ${leakChange < 0 ? "decreased" : "increased"} by $${Math.abs(leakChange).toLocaleString()}`,
            icon: leakChange < 0 ? TrendingUp : TrendingDown,
            color: leakChange < 0 ? "text-blue-600" : "text-orange-600",
            bgColor: leakChange < 0 ? "bg-blue-50" : "bg-orange-50",
            borderColor: leakChange < 0 ? "border-blue-200" : "border-orange-200",
            testId: test.id,
            revenueLeak: revenueLeak.monthly,
            previousLeak: previousLeak.monthly,
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
            score: test.overall_score || 0,
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

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 7) {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }
    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`
    }
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    }
    return "Just now"
  }

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
                      {formatTime(event.timestamp)}
                    </div>

                    {event.score !== undefined && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-gray-500">Score:</span>
                        <span className="font-semibold text-gray-900">{event.score}</span>
                        {event.scoreChange !== undefined && event.scoreChange !== 0 && (
                          <span
                            className={`font-medium ${
                              event.scoreChange > 0 ? "text-blue-600" : "text-orange-600"
                            }`}
                          >
                            {event.scoreChange > 0 ? "+" : ""}
                            {event.scoreChange}
                          </span>
                        )}
                      </div>
                    )}

                    {event.revenueLeak !== undefined && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <DollarSign className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
                        <span className="text-gray-500">Leak:</span>
                        <span className="font-semibold text-orange-600">
                          ${event.revenueLeak.toLocaleString()}/mo
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

