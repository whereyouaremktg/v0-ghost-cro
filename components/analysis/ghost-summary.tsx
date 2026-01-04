"use client"

import {
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Target,
  Lightbulb,
  Users,
  ArrowRight,
  Zap,
} from "lucide-react"
import { generateGhostSummary, type GhostSummaryInput } from "@/lib/insights/generate-ghost-summary"
import { formatPercent, formatNumber } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

const ICON_MAP = {
  dollar: DollarSign,
  "chart-down": TrendingDown,
  alert: AlertTriangle,
  target: Target,
  lightbulb: Lightbulb,
  users: Users,
}

const SEVERITY_STYLES = {
  critical: {
    bg: "bg-red-50",
    border: "border-red-100",
    icon: "text-red-500",
    indicator: "bg-red-500",
  },
  warning: {
    bg: "bg-gray-50",
    border: "border-gray-100",
    icon: "text-gray-500",
    indicator: "bg-gray-500",
  },
  info: {
    bg: "bg-gray-50",
    border: "border-gray-100",
    icon: "text-gray-400",
    indicator: "bg-gray-400",
  },
  positive: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    icon: "text-emerald-500",
    indicator: "bg-emerald-500",
  },
}

export function GhostSummary(props: GhostSummaryInput) {
  const summary = generateGhostSummary(props)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header with Ghost Score */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Ghost Summary</h2>
            <p className="text-sm text-gray-500">Executive brief of your checkout performance</p>
          </div>
        </div>

        {/* Ghost Score Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">Ghost Score</div>
            <div
              className={cn(
                "text-2xl font-bold",
                props.analysis.ghostScore < 30
                  ? "text-red-500"
                  : props.analysis.ghostScore < 50
                    ? "text-gray-500"
                    : props.analysis.ghostScore < 70
                      ? "text-yellow-500"
                      : "text-emerald-500"
              )}
            >
              {props.analysis.ghostScore}
              <span className="text-gray-300 text-lg">/100</span>
            </div>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={
                  props.analysis.ghostScore < 30
                    ? "#EF4444"
                    : props.analysis.ghostScore < 50
                      ? "#F59E0B"
                      : props.analysis.ghostScore < 70
                        ? "#EAB308"
                        : "#10B981"
                }
                strokeWidth="3"
                strokeDasharray={`${props.analysis.ghostScore}, 100`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Headline */}
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-lg text-gray-900 font-medium">{summary.headline}</p>
      </div>

      {/* Insights */}
      <div className="p-6 space-y-3">
        {summary.insights.map((insight) => {
          const Icon = ICON_MAP[insight.icon]
          const styles = SEVERITY_STYLES[insight.severity]

          return (
            <div
              key={insight.id}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border",
                styles.bg,
                styles.border
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  styles.bg
                )}
              >
                <Icon className={cn("w-4 h-4", styles.icon)} />
              </div>
              <p
                className="text-sm text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: insight.text.replace(
                    /\*\*(.*?)\*\*/g,
                    '<strong class="font-semibold text-gray-900">$1</strong>'
                  ),
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Primary Action Card */}
      <div className="px-6 pb-6">
        <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl border border-blue-200 p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-200 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <div className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">
                  Top Next Step
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {summary.primaryAction.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {summary.primaryAction.description}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-semibold text-emerald-600">
                {summary.primaryAction.estimatedImpact}
              </div>
              <div className="flex items-center justify-end gap-2 mt-1">
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    summary.primaryAction.effort === "low"
                      ? "bg-emerald-100 text-emerald-700"
                      : summary.primaryAction.effort === "medium"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-red-100 text-red-700"
                  )}
                >
                  {summary.primaryAction.effort.charAt(0).toUpperCase() +
                    summary.primaryAction.effort.slice(1)}{" "}
                  effort
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <a
              href={`#threat-${summary.primaryAction.threatId}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
            >
              View fix details
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Expandable: How we calculated this */}
      <details className="border-t border-gray-100">
        <summary className="px-6 py-3 text-sm text-gray-500 hover:text-gray-700 cursor-pointer flex items-center gap-2">
          <span>How we calculated this</span>
        </summary>
        <div className="px-6 pb-4 text-sm text-gray-600 space-y-2">
          <p>
            <strong>Revenue opportunity:</strong> Based on your{" "}
            {formatNumber(props.snapshot.metrics.monthlyVisitors)} monthly visitors
            converting at {formatPercent(props.snapshot.metrics.conversionRate)} vs
            the {props.snapshot.benchmarks.categoryName} average of{" "}
            {formatPercent(props.snapshot.benchmarks.avgConversionRate)}.
          </p>
          <p>
            <strong>Simulation:</strong> {props.simulation.totalBuyers} AI buyer
            personas with different demographics, budgets, and shopping behaviors
            tested your checkout flow.
          </p>
          <p>
            <strong>Ghost Score:</strong> Weighted score based on{" "}
            {props.analysis.threats.length} identified issues, simulation results,
            and comparison to top-performing stores.
          </p>
        </div>
      </details>
    </div>
  )
}



