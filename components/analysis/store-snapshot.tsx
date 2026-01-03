"use client"

import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Target,
  ArrowRight,
} from "lucide-react"
import { formatCurrency, formatPercent, formatNumber, formatRelativeTime } from "@/lib/utils/format"
import type { CategoryBenchmark } from "@/lib/data/benchmarks"

export interface StoreSnapshotProps {
  storeUrl: string
  storeName: string
  lastScanAt: Date | string
  // Core metrics from Shopify
  metrics: {
    monthlyVisitors: number
    monthlyOrders: number
    conversionRate: number // as decimal: 0.012 = 1.2%
    averageOrderValue: number
    monthlyRevenue: number
  }
  // Funnel data
  funnel: {
    visitors: number
    addedToCart: number
    reachedCheckout: number
    purchased: number
  }
  // Category benchmarks
  benchmarks: CategoryBenchmark
  // Calculated opportunity
  opportunity: {
    currentMonthlyRevenue: number
    potentialMonthlyRevenue: number // if they hit benchmark
    monthlyGap: number
    annualGap: number
  }
}

export function StoreSnapshot({
  storeUrl,
  storeName,
  lastScanAt,
  metrics,
  funnel,
  benchmarks,
  opportunity,
}: StoreSnapshotProps) {
  // Calculate comparisons
  const crDiff =
    ((metrics.conversionRate - benchmarks.avgConversionRate) /
      benchmarks.avgConversionRate) *
    100
  const crStatus =
    crDiff >= 0 ? "positive" : crDiff > -20 ? "warning" : "critical"

  const aovDiff =
    ((metrics.averageOrderValue - benchmarks.avgAOV) / benchmarks.avgAOV) * 100
  const aovStatus = aovDiff >= 0 ? "positive" : "warning"

  // Funnel drop-off calculations
  const cartDropOff = ((funnel.visitors - funnel.addedToCart) / funnel.visitors) * 100
  const checkoutDropOff =
    ((funnel.addedToCart - funnel.reachedCheckout) / funnel.addedToCart) * 100
  const purchaseDropOff =
    ((funnel.reachedCheckout - funnel.purchased) / funnel.reachedCheckout) * 100

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Store Snapshot</h2>
          <p className="text-sm text-gray-500">{storeUrl}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Last analyzed</p>
          <p className="text-sm text-gray-600">{formatRelativeTime(lastScanAt)}</p>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Monthly Visitors */}
          <MetricCard
            icon={<Users className="w-5 h-5" />}
            label="Monthly Visitors"
            value={formatNumber(metrics.monthlyVisitors)}
            subtext="Last 30 days"
          />

          {/* Conversion Rate */}
          <MetricCard
            icon={<Target className="w-5 h-5" />}
            label="Conversion Rate"
            value={formatPercent(metrics.conversionRate)}
            comparison={{
              value: crDiff,
              label: `vs ${benchmarks.categoryName} avg (${formatPercent(benchmarks.avgConversionRate)})`,
              status: crStatus,
            }}
          />

          {/* Average Order Value */}
          <MetricCard
            icon={<ShoppingCart className="w-5 h-5" />}
            label="Avg Order Value"
            value={formatCurrency(metrics.averageOrderValue)}
            comparison={{
              value: aovDiff,
              label: `vs ${benchmarks.categoryName} avg`,
              status: aovStatus,
            }}
          />

          {/* Monthly Revenue */}
          <MetricCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Monthly Revenue"
            value={formatCurrency(metrics.monthlyRevenue)}
            subtext={`${metrics.monthlyOrders} orders`}
          />
        </div>

        {/* Conversion Funnel */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Conversion Funnel</h3>
          <div className="bg-gray-50 rounded-xl p-4">
            <FunnelVisualization
              stages={[
                {
                  name: "Visitors",
                  value: funnel.visitors,
                  dropOff: null,
                  status: "neutral",
                },
                {
                  name: "Added to Cart",
                  value: funnel.addedToCart,
                  dropOff: cartDropOff,
                  status:
                    cartDropOff > 95
                      ? "critical"
                      : cartDropOff > 90
                        ? "warning"
                        : "healthy",
                },
                {
                  name: "Reached Checkout",
                  value: funnel.reachedCheckout,
                  dropOff: checkoutDropOff,
                  status:
                    checkoutDropOff > 70
                      ? "critical"
                      : checkoutDropOff > 50
                        ? "warning"
                        : "healthy",
                },
                {
                  name: "Purchased",
                  value: funnel.purchased,
                  dropOff: purchaseDropOff,
                  status:
                    purchaseDropOff > 50
                      ? "critical"
                      : purchaseDropOff > 30
                        ? "warning"
                        : "healthy",
                },
              ]}
            />
          </div>
        </div>

        {/* Revenue Opportunity Card */}
        <div className="bg-gradient-to-br from-lime-50 to-emerald-50 rounded-xl border border-lime-100 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Revenue Opportunity
              </h3>
              <p className="text-3xl font-semibold text-gray-900">
                {formatCurrency(opportunity.monthlyGap)}
                <span className="text-lg text-gray-500">/mo</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatCurrency(opportunity.annualGap)} per year if you match category
                average
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-2">Your potential</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {formatCurrency(metrics.monthlyRevenue)}
                </span>
                <ArrowRight className="w-4 h-4 text-lime-600" />
                <span className="text-sm font-semibold text-lime-700">
                  {formatCurrency(opportunity.potentialMonthlyRevenue)}
                </span>
              </div>
            </div>
          </div>

          {/* Mini comparison bar */}
          <div className="mt-4 pt-4 border-t border-lime-200">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Your CR: {formatPercent(metrics.conversionRate)}</span>
              <span>Category avg: {formatPercent(benchmarks.avgConversionRate)}</span>
              <span>Top 10%: {formatPercent(benchmarks.topPerformerCR)}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-lime-400 rounded-full" />
              {/* Marker for user's position */}
              <div
                className="absolute -top-1 w-1 h-4 bg-gray-900 rounded-full transform -translate-x-1/2"
                style={{
                  left: `${Math.min(
                    (metrics.conversionRate / benchmarks.topPerformerCR) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sub-component: Metric Card
interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  subtext?: string
  comparison?: {
    value: number
    label: string
    status: "positive" | "warning" | "critical"
  }
}

function MetricCard({ icon, label, value, subtext, comparison }: MetricCardProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
      {comparison && (
        <div
          className={`flex items-center gap-1 text-xs mt-1 ${
            comparison.status === "positive"
              ? "text-emerald-600"
              : comparison.status === "warning"
                ? "text-amber-600"
                : "text-red-600"
          }`}
        >
          {comparison.value >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>
            {comparison.value >= 0 ? "+" : ""}
            {comparison.value.toFixed(0)}% {comparison.label}
          </span>
        </div>
      )}
    </div>
  )
}

// Sub-component: Funnel Visualization
interface FunnelStage {
  name: string
  value: number
  dropOff: number | null
  status: "neutral" | "healthy" | "warning" | "critical"
}

function FunnelVisualization({ stages }: { stages: FunnelStage[] }) {
  const maxValue = stages[0].value

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => (
        <div key={stage.name} className="flex items-center gap-4">
          {/* Stage name */}
          <div className="w-32 text-sm text-gray-600">{stage.name}</div>

          {/* Bar */}
          <div className="flex-1 h-8 bg-gray-200 rounded-lg overflow-hidden relative">
            <div
              className={`h-full rounded-lg transition-all duration-500 ${
                stage.status === "critical"
                  ? "bg-red-400"
                  : stage.status === "warning"
                    ? "bg-amber-400"
                    : stage.status === "healthy"
                      ? "bg-emerald-400"
                      : "bg-lime-400"
              }`}
              style={{ width: `${(stage.value / maxValue) * 100}%` }}
            />
            {/* Value label inside bar */}
            <div className="absolute inset-0 flex items-center px-3">
              <span className="text-sm font-medium text-gray-900">
                {formatNumber(stage.value)}
              </span>
            </div>
          </div>

          {/* Drop-off indicator */}
          <div className="w-20 text-right">
            {stage.dropOff !== null && (
              <span
                className={`text-sm font-medium ${
                  stage.status === "critical"
                    ? "text-red-600"
                    : stage.status === "warning"
                      ? "text-amber-600"
                      : "text-gray-500"
                }`}
              >
                ↓ {stage.dropOff.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

