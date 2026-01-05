"use client"

import { useState } from "react"
import { CircularScore } from "@/components/dashboard/circular-score"
import { calculateRevenueOpportunity, formatOpportunityRange } from "@/lib/calculations/revenue-opportunity"
import { formatCurrency } from "@/lib/utils/format"
import { getPercentileLabel, calculatePercentileBenchmark } from "@/lib/ghostEngine"
import type { TestResult } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { AlertTriangle, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react"

interface MerchantSummaryProps {
  result: TestResult
  onViewFix?: (fix: any) => void
}

export function MerchantSummary({ result, onViewFix }: MerchantSummaryProps) {
  // Calculate revenue opportunity
  const revenueOpportunity = calculateRevenueOpportunity({
    monthlyVisitors: 50000, // Default - should come from Store Leads or Shopify
    currentConversionRate: 0.025, // Default - should be calculated from actual data
    aov: 85, // Default - should come from Shopify metrics
    categoryBenchmarkCR: 0.028, // Default - should come from benchmarks
  })

  // Calculate percentile with industry adjustment
  const industry = result.storeAnalysis?.industry || null
  const percentileValue = calculatePercentileBenchmark(result.score, industry)
  const percentile = getPercentileLabel(percentileValue, industry)

  // Get top 3 recommendations sorted by priority
  const topRecommendations = result.recommendations
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)

  // Get impact level for display
  const getImpactBadge = (impact: string) => {
    const impactLower = impact.toLowerCase()
    if (impactLower.includes("high") || impactLower.includes("critical")) {
      return { label: "High Impact", className: "bg-red-50 text-red-600 border-red-200" }
    }
    if (impactLower.includes("medium")) {
      return { label: "Medium Impact", className: "bg-yellow-50 text-yellow-600 border-yellow-200" }
    }
    return { label: "Low Impact", className: "bg-gray-50 text-gray-600 border-gray-200" }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Score */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Checkout Health Score</h1>
          <p className="text-sm text-zinc-500">
            {percentile} of stores in your industry
          </p>
        </div>
        <CircularScore 
          score={result.score} 
          percentile={percentile}
        />
      </div>

      {/* Revenue Hero Card */}
      <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-red-900 mb-1">Monthly Revenue Opportunity</h2>
            <p className="text-3xl font-bold text-red-600 mb-2">
              {formatOpportunityRange(
                revenueOpportunity.monthlyOpportunity.min,
                revenueOpportunity.monthlyOpportunity.max
              )}
            </p>
            <p className="text-sm text-red-700">
              You're leaving ${formatCurrency(revenueOpportunity.monthlyOpportunity.min)} - ${formatCurrency(revenueOpportunity.monthlyOpportunity.max)} on the table each month
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 Fixes */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Top 3 Priority Fixes
        </h2>
        <div className="space-y-3">
          {topRecommendations.map((rec, index) => {
            const impactBadge = getImpactBadge(rec.impact)
            return (
              <div
                key={rec.priority}
                className="rounded-xl border border-zinc-200 bg-white shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {rec.priority}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-zinc-900 mb-1">{rec.title}</h3>
                      <p className="text-sm text-zinc-600 line-clamp-2">{rec.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${impactBadge.className}`}>
                      {impactBadge.label}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rec.effort === "low" ? "bg-green-50 text-green-600 border border-green-200" :
                      rec.effort === "medium" ? "bg-yellow-50 text-yellow-600 border border-yellow-200" :
                      "bg-red-50 text-red-600 border border-red-200"
                    }`}>
                      {rec.effort.charAt(0).toUpperCase() + rec.effort.slice(1)} Effort
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onViewFix?.(rec)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    View Fix
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

