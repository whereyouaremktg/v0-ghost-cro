"use client"

import { useState, useMemo, useEffect } from "react"
import { Calculator, TrendingUp, DollarSign, Store } from "lucide-react"
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

  return (
    <div className="bg-card border-2 border-border brutal-shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary border-2 border-border">
            <Calculator className="h-5 w-5 text-primary-foreground" strokeWidth={3} />
          </div>
          <h2 className="text-lg font-bold uppercase tracking-tight">Revenue Opportunity</h2>
        </div>

        {/* Shopify Connection Status */}
        {shopifyStore ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border-2 border-primary">
            <Store className="h-3.5 w-3.5 text-primary" strokeWidth={3} />
            <span className="text-xs font-bold text-primary uppercase tracking-wide">
              Connected: {shopifyStore.shop.split(".")[0]}
              {loadingMetrics && <span className="ml-2">...</span>}
            </span>
          </div>
        ) : (
          <Link
            href="/dashboard/settings"
            className="text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors underline"
          >
            Connect Shopify for auto-sync
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">
            Your Current Metrics
          </div>

          {/* Monthly Sessions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-2">Monthly Sessions</label>
            <input
              type="number"
              value={sessions}
              onChange={(e) => setSessions(Number(e.target.value))}
              className="w-full px-4 py-3 bg-background border-2 border-border font-mono text-lg font-bold focus:outline-none focus:border-primary"
            />
          </div>

          {/* Current CVR */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-2">Current Conversion Rate (%)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={cvr}
                onChange={(e) => setCvr(Number(e.target.value))}
                className="w-full px-4 py-3 bg-background border-2 border-border font-mono text-lg font-bold focus:outline-none focus:border-primary pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">%</span>
            </div>
          </div>

          {/* AOV */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wide">Average Order Value ($)</label>
              {shopifyMetrics?.metrics?.averageOrderValue && (
                <span className="text-xs text-primary font-bold uppercase tracking-wide">
                  ✓ Synced
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
              <input
                type="number"
                value={aov}
                onChange={(e) => setAov(Number(e.target.value))}
                className="w-full px-4 py-3 pl-8 bg-background border-2 border-border font-mono text-lg font-bold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Current Revenue */}
          <div className="pt-4 border-t-2 border-border">
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
              Current Monthly Revenue
            </div>
            <div className="text-3xl font-mono font-bold">{formatCurrency(calculations.currentRevenue)}</div>
          </div>

          {/* Manual Override Note */}
          {shopifyStore && (
            <div className="text-xs text-muted-foreground italic">
              Values are auto-synced from Shopify. You can manually adjust them as needed.
            </div>
          )}
        </div>

        {/* Projections */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">Projected Outcomes</div>

          {/* 3.5% CVR Projection */}
          <div className="bg-background border-2 border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" strokeWidth={3} />
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                If you reach 3.5% CVR
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-mono font-bold">{formatCurrency(calculations.revenue35)}</span>
              <span className="text-sm font-bold text-primary">+{formatCurrency(calculations.delta35)}</span>
            </div>
          </div>

          {/* 4% CVR Projection */}
          <div className="bg-background border-2 border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" strokeWidth={3} />
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                If you reach 4% CVR
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-mono font-bold">{formatCurrency(calculations.revenue40)}</span>
              <span className="text-sm font-bold text-primary">+{formatCurrency(calculations.delta40)}</span>
            </div>
          </div>

          {/* Max Upside */}
          <div className="bg-primary/10 border-2 border-primary p-4 brutal-shadow">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" strokeWidth={3} />
              <span className="text-xs font-bold uppercase tracking-wide text-primary">Potential Monthly Upside</span>
            </div>
            <div className="text-4xl font-mono font-bold text-primary">{formatCurrency(calculations.maxUpside)}</div>
            <div className="text-xs text-muted-foreground mt-1">Additional revenue per month at 4% CVR</div>
          </div>
        </div>
      </div>
    </div>
  )
}
