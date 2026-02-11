"use client"

import { BarChart3 } from "lucide-react"
import type { TestResult } from "@/lib/types"

// ── Mini Funnel Bar ───────────────────────────────────────────────

function MiniFunnelBar({ value, max, label, color = "blue" }: { value: number; max: number; label: string; color?: string }) {
  const percentage = Math.min((value / max) * 100, 100)
  const colorClass = color === "blue" ? "bg-blue-500" : color === "red" ? "bg-red-500" : "bg-gray-400"

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ── Analytics Section ─────────────────────────────────────────────

interface AnalyticsSectionProps {
  test: TestResult
  purchaseRate: number
  purchaseCount: number
  abandonCount: number
  visibleSections: Set<string>
  sectionRef: React.Ref<HTMLDivElement>
}

export function AnalyticsSection({
  test,
  purchaseRate,
  purchaseCount,
  abandonCount,
  visibleSections,
  sectionRef,
}: AnalyticsSectionProps) {
  return (
    <section
      id="analytics"
      ref={sectionRef}
      data-section-id="analytics"
      className={`mb-20 scroll-mt-24 section-scroll-in ${visibleSections.has("analytics") ? "visible" : ""}`}
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <BarChart3 className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold font-heading mb-1 text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-600">Conversion funnel and performance metrics</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Chart */}
        <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-8 backdrop-blur-xl" style={{background: "rgba(255, 255, 255, 0.95)"}}>
          <h3 className="text-xs font-medium tracking-wide text-gray-500 mb-6 font-heading">Conversion Funnel</h3>
          <div className="space-y-3 mb-6">
            <MiniFunnelBar value={test.funnelData.landed} max={test.funnelData.landed} label="Landed" color="blue" />
            <MiniFunnelBar value={test.funnelData.cart} max={test.funnelData.landed} label="Cart" color="blue" />
            <MiniFunnelBar value={test.funnelData.checkout} max={test.funnelData.landed} label="Checkout" color="blue" />
            <MiniFunnelBar value={test.funnelData.purchased} max={test.funnelData.landed} label="Purchased" color="blue" />
          </div>
          {/* Vertical bars */}
          <div className="flex items-end justify-between gap-3 h-48">
            {Object.entries(test.funnelData).map(([stage, count], index) => {
              const height = (count / test.funnelData.landed) * 100
              const prevCount = index > 0 ? Object.values(test.funnelData)[index - 1] : count
              const dropoff = Math.round(((prevCount - count) / prevCount) * 100)
              return (
                <div key={stage} className="flex-1 flex flex-col items-center group">
                  <div className="w-full relative" style={{ height: `${height}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-300 to-blue-100 border border-blue-200 rounded-t-[16px] transition-all duration-300 group-hover:from-blue-400 group-hover:to-blue-200" />
                  </div>
                  <div className="mt-4 text-center">
                    <div className="font-heading font-bold text-base mb-1 text-gray-900">{count}</div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">{stage}</div>
                    {index > 0 && dropoff > 0 && (
                      <div className="text-xs text-red-600 font-medium mt-1.5">-{dropoff}%</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Score Trend & Stats */}
        <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-8 backdrop-blur-xl" style={{background: "rgba(255, 255, 255, 0.95)"}}>
          <h3 className="text-xs font-medium tracking-wide text-gray-500 mb-6 font-heading">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl">
              <div className="text-xs font-medium text-gray-500 mb-2">Conversion Rate</div>
              <div className="text-4xl font-heading font-bold text-blue-600">{purchaseRate}%</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl">
                <div className="text-xs font-medium text-gray-500 mb-2">Would Purchase</div>
                <div className="text-2xl font-heading font-bold text-blue-600">{purchaseCount}</div>
              </div>
              <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl">
                <div className="text-xs font-medium text-gray-500 mb-2">Would Abandon</div>
                <div className="text-2xl font-heading font-bold text-red-600">{abandonCount}</div>
              </div>
            </div>
            {test.previousScore && (
              <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl">
                <div className="text-xs font-medium text-gray-500 mb-2">Score Change</div>
                <div
                  className={`text-2xl font-heading font-bold ${test.change && test.change >= 0 ? "text-blue-600" : "text-red-600"}`}
                >
                  {test.change && test.change >= 0 ? "+" : ""}{test.change || 0} points
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
