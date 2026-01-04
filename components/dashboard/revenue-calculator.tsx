"use client"

import { useState, useMemo, useEffect } from "react"
import { Calculator, TrendingUp, DollarSign, Store } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts"
import Link from "next/link"

interface RevenueCalculatorProps {
  shopifyMetrics?: any
  shopifyStore?: any
  loadingMetrics?: boolean
}

export function RevenueCalculator({
  shopifyMetrics,
  shopifyStore,
  loadingMetrics,
}: RevenueCalculatorProps) {
  const [sessions, setSessions] = useState(50000)
  const [cvr, setCvr] = useState(2.5)
  const [aov, setAov] = useState(85)

  // Auto-populate from Shopify metrics when available
  useEffect(() => {
    if (shopifyMetrics?.metrics) {
      const metrics = shopifyMetrics.metrics

      // Set AOV from Shopify
      if (metrics.averageOrderValue && metrics.averageOrderValue > 0) {
        setAov(Math.round(metrics.averageOrderValue))
      }

      // Calculate sessions from revenue and CVR if we have the data
      // For now, keep sessions at default since we don't have session data from Shopify
      // Users can adjust manually
    }
  }, [shopifyMetrics])

  const calculations = useMemo(() => {
    const currentRevenue = sessions * (cvr / 100) * aov
    const revenue35 = sessions * 0.035 * aov
    const revenue40 = sessions * 0.04 * aov
    const delta35 = revenue35 - currentRevenue
    const delta40 = revenue40 - currentRevenue
    const maxUpside = Math.max(delta35, delta40)

    return {
      currentRevenue,
      revenue35,
      revenue40,
      delta35,
      delta40,
      maxUpside,
    }
  }, [sessions, cvr, aov])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Prepare chart data
  const chartData = useMemo(() => [
    {
      name: "Current",
      value: calculations.currentRevenue,
      label: `${cvr}% CVR`,
      color: "rgb(148 163 184)", // slate-400
    },
    {
      name: "3.5% CVR",
      value: calculations.revenue35,
      label: "+" + formatCurrency(calculations.delta35),
      color: "rgb(16 185 129)", // emerald-500
    },
    {
      name: "4% CVR",
      value: calculations.revenue40,
      label: "+" + formatCurrency(calculations.delta40),
      color: "rgb(0 112 243)", // electric blue accent
    },
  ], [calculations, cvr])

  return (
    <div className="card-premium p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl">
            <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
          </div>
          <h2 className="text-lg font-semibold tracking-tight font-heading">Revenue Opportunity</h2>
        </div>

        {/* Shopify Connection Status */}
        {shopifyStore ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg">
            <Store className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 tracking-wide">
              Connected: {shopifyStore.shop.split(".")[0]}
              {loadingMetrics && <span className="ml-2">...</span>}
            </span>
          </div>
        ) : (
          <Link
            href="/dashboard/settings"
            className="text-xs font-medium tracking-wide text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline hover:no-underline"
          >
            Connect Shopify for auto-sync
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <p className="metric-label">Your Current Metrics</p>

          {/* Monthly Sessions */}
          <div>
            <label className="metric-label block mb-2">Monthly Sessions</label>
            <input
              type="number"
              value={sessions}
              onChange={(e) => setSessions(Number(e.target.value))}
              className="w-full px-0 py-2 bg-transparent border-0 border-b border-border/50 text-lg font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Current CVR */}
          <div>
            <label className="metric-label block mb-2">Current Conversion Rate</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={cvr}
                onChange={(e) => setCvr(Number(e.target.value))}
                className="w-full px-0 py-2 pr-8 bg-transparent border-0 border-b border-border/50 text-lg font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
            </div>
          </div>

          {/* AOV */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="metric-label">Average Order Value</label>
              {shopifyMetrics?.metrics?.averageOrderValue && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ Synced
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <input
                type="number"
                value={aov}
                onChange={(e) => setAov(Number(e.target.value))}
                className="w-full px-0 py-2 pl-6 bg-transparent border-0 border-b border-border/50 text-lg font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Current Revenue */}
          <div className="pt-6 border-t border-border/30">
            <p className="metric-label mb-2">Current Monthly Revenue</p>
            <p className="metric-secondary">{formatCurrency(calculations.currentRevenue)}</p>
          </div>

          {/* Manual Override Note */}
          {shopifyStore && (
            <div className="text-xs text-muted-foreground italic">
              Values are auto-synced from Shopify. You can manually adjust them as needed.
            </div>
          )}
        </div>

        {/* Projections with Chart */}
        <div className="space-y-4">
          <div className="text-[11px] font-medium tracking-wide text-muted-foreground/60 mb-3">Projected Outcomes</div>

          {/* Bar Chart Comparison */}
          <div className="bg-muted/30 border-0 rounded-2xl p-6 mb-6">
            <div className="h-56 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fontFamily: "var(--font-heading)", fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 0.5 }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fontFamily: "var(--font-heading)", fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
                      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
                      return `$${value}`
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border border-border/50 rounded-xl shadow-lg p-4 backdrop-blur-sm">
                            <p className="metric-label mb-1">{data.name}</p>
                            <p className="metric-tertiary">{formatCurrency(data.value)}</p>
                            {data.label && data.name !== "Current" && (
                              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium">{data.label}</p>
                            )}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[10, 10, 0, 0]}
                    className="transition-all duration-300 hover:opacity-80"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm">
              {chartData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Max Upside Highlight */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-950/20 dark:to-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
            <p className="metric-label mb-3">Potential Monthly Upside</p>
            <p className="metric-hero text-blue-600 dark:text-blue-400">{formatCurrency(calculations.maxUpside)}</p>
            <p className="text-sm text-muted-foreground mt-3">Additional revenue at 4% CVR</p>
          </div>
        </div>
      </div>
    </div>
  )
}
