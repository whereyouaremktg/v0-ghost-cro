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
      color: "var(--muted-foreground)",
    },
    {
      name: "3.5% CVR",
      value: calculations.revenue35,
      label: "+" + formatCurrency(calculations.delta35),
      color: "var(--chart-2)",
    },
    {
      name: "4% CVR",
      value: calculations.revenue40,
      label: "+" + formatCurrency(calculations.delta40),
      color: "var(--primary)",
    },
  ], [calculations, cvr])

  return (
    <div className="bg-card/40 border border-border/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-5 card-hover animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 border border-primary/30 rounded-xl">
            <Calculator className="h-4 w-4 text-primary" strokeWidth={2.5} />
          </div>
          <h2 className="text-base font-medium tracking-tight font-heading">Revenue Opportunity</h2>
        </div>

        {/* Shopify Connection Status */}
        {shopifyStore ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-xl">
            <Store className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
            <span className="text-xs font-medium text-primary tracking-wide">
              Connected: {shopifyStore.shop.split(".")[0]}
              {loadingMetrics && <span className="ml-2">...</span>}
            </span>
          </div>
        ) : (
          <Link
            href="/dashboard/settings"
            className="text-xs font-medium tracking-wide text-muted-foreground hover:text-primary transition-colors underline hover:no-underline"
          >
            Connect Shopify for auto-sync
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="text-[11px] font-medium tracking-wide text-muted-foreground/60 mb-3">
            Your Current Metrics
          </div>

          {/* Monthly Sessions */}
          <div>
            <label className="block text-[11px] font-medium tracking-wide mb-1.5 text-muted-foreground/70">Monthly Sessions</label>
            <input
              type="number"
              value={sessions}
              onChange={(e) => setSessions(Number(e.target.value))}
              className="w-full px-3 py-2 bg-background/50 border border-border/30 rounded-md font-mono text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Current CVR */}
          <div>
            <label className="block text-[11px] font-medium tracking-wide mb-1.5 text-muted-foreground/70">Current Conversion Rate (%)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={cvr}
                onChange={(e) => setCvr(Number(e.target.value))}
                className="w-full px-3 py-2 bg-background/50 border border-border/30 rounded-md font-mono text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 font-medium text-sm">%</span>
            </div>
          </div>

          {/* AOV */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium tracking-wide text-muted-foreground/70">Average Order Value ($)</label>
              {shopifyMetrics?.metrics?.averageOrderValue && (
                <span className="text-[10px] text-primary font-medium tracking-wide">
                  ✓ Synced
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 font-medium text-sm">$</span>
              <input
                type="number"
                value={aov}
                onChange={(e) => setAov(Number(e.target.value))}
                className="w-full px-3 py-2 pl-7 bg-background/50 border border-border/30 rounded-md font-mono text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Current Revenue */}
          <div className="pt-3 border-t border-border/20">
            <div className="text-[11px] font-medium tracking-wide text-muted-foreground/70 mb-1">
              Current Monthly Revenue
            </div>
            <div className="text-2xl font-mono font-bold">{formatCurrency(calculations.currentRevenue)}</div>
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
          <div className="bg-background/20 border border-border/20 rounded-xl p-4 mb-4">
            <div className="h-48 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fontFamily: "var(--font-heading)", fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fontFamily: "var(--font-heading)", fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    width={50}
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
                          <div className="bg-card border border-border/50 rounded-xl shadow-xl p-3 backdrop-blur-sm">
                            <p className="text-xs text-muted-foreground mb-1">{data.name}</p>
                            <p className="text-sm font-heading font-semibold">{formatCurrency(data.value)}</p>
                            {data.label && data.name !== "Current" && (
                              <p className="text-xs text-primary mt-1">{data.label}</p>
                            )}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    className="transition-all duration-300 hover:opacity-80"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
              {chartData.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Max Upside Highlight */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary/80" strokeWidth={2.5} />
              <span className="text-xs font-medium tracking-wide text-primary/80">Potential Monthly Upside</span>
            </div>
            <div className="text-2xl font-heading font-bold text-primary">{formatCurrency(calculations.maxUpside)}</div>
            <div className="text-[10px] text-muted-foreground/60 mt-1">Additional revenue per month at 4% CVR</div>
          </div>
        </div>
      </div>
    </div>
  )
}
