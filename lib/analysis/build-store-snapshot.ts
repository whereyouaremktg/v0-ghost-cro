/**
 * Build Store Snapshot data from test results and Shopify metrics
 */

import type { TestResult } from "@/lib/types"
import { getCategoryBenchmarks } from "@/lib/data/benchmarks"
import { calculateRevenueOpportunity } from "@/lib/calculations/revenue-opportunity"

export interface StoreSnapshotData {
  storeUrl: string
  storeName: string
  lastScanAt: Date | string
  metrics: {
    monthlyVisitors: number
    monthlyOrders: number
    conversionRate: number
    averageOrderValue: number
    monthlyRevenue: number
  }
  funnel: {
    visitors: number
    addedToCart: number
    reachedCheckout: number
    purchased: number
  }
  benchmarks: ReturnType<typeof getCategoryBenchmarks>
  opportunity: {
    currentMonthlyRevenue: number
    potentialMonthlyRevenue: number
    monthlyGap: number
    annualGap: number
  }
}

interface ShopifyMetrics {
  metrics?: {
    totalSessions?: number
    totalOrders?: number
    averageOrderValue?: number
    totalRevenue?: number
  }
}

/**
 * Build store snapshot from test result and Shopify metrics
 */
export function buildStoreSnapshot(
  test: TestResult,
  shopifyMetrics: ShopifyMetrics | null,
  storeUrl?: string,
  storeName?: string
): StoreSnapshotData {
  // Get metrics from Shopify or use defaults from test
  const monthlyVisitors = shopifyMetrics?.metrics?.totalSessions || test.funnelData.landed * 30 || 50000
  const monthlyOrders = shopifyMetrics?.metrics?.totalOrders || Math.round(monthlyVisitors * 0.025) || 1250
  const aov = shopifyMetrics?.metrics?.averageOrderValue || 85
  const monthlyRevenue = shopifyMetrics?.metrics?.totalRevenue || monthlyOrders * aov

  // Calculate conversion rate
  const conversionRate = monthlyVisitors > 0 ? monthlyOrders / monthlyVisitors : 0.025

  // Build funnel from test data (scale to monthly if needed)
  const funnelMultiplier = monthlyVisitors / test.funnelData.landed || 1
  const funnel = {
    visitors: Math.round(test.funnelData.landed * funnelMultiplier),
    addedToCart: Math.round(test.funnelData.cart * funnelMultiplier),
    reachedCheckout: Math.round(test.funnelData.checkout * funnelMultiplier),
    purchased: Math.round(test.funnelData.purchased * funnelMultiplier),
  }

  // Get benchmarks (default to 'default' category if no industry data)
  const benchmarks = getCategoryBenchmarks(null)

  // Calculate opportunity using existing utility
  const categoryBenchmarkCR = benchmarks.avgConversionRate
  const revenueOpportunity = calculateRevenueOpportunity({
    monthlyVisitors,
    currentConversionRate: conversionRate,
    aov,
    categoryBenchmarkCR,
  })

  return {
    storeUrl: storeUrl || test.storeUrl || "Unknown Store",
    storeName: storeName || "Your Store",
    lastScanAt: test.createdAt || new Date(),
    metrics: {
      monthlyVisitors,
      monthlyOrders,
      conversionRate,
      averageOrderValue: aov,
      monthlyRevenue,
    },
    funnel,
    benchmarks,
    opportunity: {
      currentMonthlyRevenue: revenueOpportunity.currentMonthlyRevenue,
      potentialMonthlyRevenue: revenueOpportunity.potentialMonthlyRevenue,
      monthlyGap: revenueOpportunity.monthlyOpportunity.max,
      annualGap: revenueOpportunity.annualOpportunity,
    },
  }
}

