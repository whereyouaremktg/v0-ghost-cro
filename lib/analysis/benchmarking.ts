/**
 * Store Intelligence Benchmarking Service
 * Ties together the database and Store Leads API
 */

import { supabaseAdmin } from "@/lib/supabase/admin"
import { fetchStoreLeadsData } from "@/lib/storeleads/client"

interface StoreIntelligenceRow {
  id: string
  domain: string
  estimated_sales_monthly: number | null
  estimated_traffic_monthly: number | null
  global_rank: number | null
  industry: string | null
  platform: string | null
  technologies: any
  created_at: string
  updated_at: string
}

interface BenchmarkData {
  monthlyRevenue: number
  monthlyTraffic: number
  percentile: number // 0-100, where 100 is top performer
  competitorGap: number // Difference from top performer in industry
  industry: string | null
  platform: string | null
  apps: string[]
}

/**
 * Clean domain for consistent storage/lookup
 */
function cleanDomain(domain: string): string {
  return domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase()
    .trim()
}

/**
 * Calculate percentile based on global rank
 * Top 10% if rank < 100k, etc.
 */
function calculatePercentile(rank: number | null): number {
  if (!rank) return 50 // Default to median if no rank

  // Rough percentile calculation based on rank
  // Lower rank = higher percentile
  if (rank < 10000) return 95 // Top 5%
  if (rank < 50000) return 90 // Top 10%
  if (rank < 100000) return 85 // Top 15%
  if (rank < 500000) return 75 // Top 25%
  if (rank < 1000000) return 60 // Top 40%
  if (rank < 5000000) return 50 // Top 50%
  return 30 // Bottom half
}

/**
 * Calculate competitor gap (difference from top performer)
 * For now, we'll use a simple multiplier based on percentile
 */
function calculateCompetitorGap(
  monthlyRevenue: number,
  percentile: number
): number {
  // If in top 10%, gap is minimal
  if (percentile >= 90) return 0

  // Calculate what top performer would make (assume 2x for top 10%)
  const topPerformerRevenue = monthlyRevenue * (100 / percentile) * 0.1

  return Math.max(0, topPerformerRevenue - monthlyRevenue)
}

/**
 * Get default benchmark data (fallback)
 */
function getDefaultBenchmark(): BenchmarkData {
  return {
    monthlyRevenue: 50000,
    monthlyTraffic: 100000,
    percentile: 50,
    competitorGap: 50000,
    industry: "Retail",
    platform: "Shopify",
    apps: [],
  }
}

/**
 * Check if data is fresh (< 30 days old)
 */
function isDataFresh(updatedAt: string): boolean {
  const updated = new Date(updatedAt)
  const now = new Date()
  const daysDiff = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24)
  return daysDiff < 30
}

/**
 * Get store benchmarks from database or API
 * @param domain - Store domain
 * @returns Benchmark data for the store
 */
export async function getStoreBenchmarks(
  domain: string
): Promise<BenchmarkData> {
  const cleanedDomain = cleanDomain(domain)

  try {
    // 1. Check Supabase for existing data
    const { data: existingData, error: queryError } = await supabaseAdmin
      .from("store_intelligence")
      .select("*")
      .eq("domain", cleanedDomain)
      .maybeSingle()

    // 2. If found and fresh, return it
    if (existingData && !queryError && isDataFresh(existingData.updated_at)) {
      const percentile = calculatePercentile(existingData.global_rank)
      const monthlyRevenue = existingData.estimated_sales_monthly || 0
      const monthlyTraffic = existingData.estimated_traffic_monthly || 0

      return {
        monthlyRevenue,
        monthlyTraffic,
        percentile,
        competitorGap: calculateCompetitorGap(monthlyRevenue, percentile),
        industry: existingData.industry,
        platform: existingData.platform,
        apps: (existingData.technologies || []).map((tech: any) => tech.name || tech),
      }
    }

    // 3. Data missing or stale - fetch from API
    const apiData = await fetchStoreLeadsData(cleanedDomain)

    if (apiData) {
      // 4. Upsert to Supabase
      const upsertData = {
        domain: cleanedDomain,
        estimated_sales_monthly: apiData.revenue,
        estimated_traffic_monthly: apiData.traffic,
        global_rank: apiData.rank,
        industry: null, // API doesn't provide this directly
        platform: null, // API doesn't provide this directly
        technologies: apiData.apps.map((name) => ({ name })),
        updated_at: new Date().toISOString(),
      }

      const { error: upsertError } = await supabaseAdmin
        .from("store_intelligence")
        .upsert(upsertData, {
          onConflict: "domain",
        })

      if (upsertError) {
        console.error("Failed to save store intelligence:", upsertError)
      }

      // 5. Return normalized data
      const percentile = calculatePercentile(apiData.rank)
      const monthlyRevenue = apiData.revenue || 0
      const monthlyTraffic = apiData.traffic || 0

      return {
        monthlyRevenue,
        monthlyTraffic,
        percentile,
        competitorGap: calculateCompetitorGap(monthlyRevenue, percentile),
        industry: null,
        platform: null,
        apps: apiData.apps,
      }
    }

    // 6. Fallback if API fails
    console.warn(`No benchmark data available for ${cleanedDomain}, using defaults`)
    return getDefaultBenchmark()
  } catch (error) {
    console.error("Error fetching store benchmarks:", error)
    return getDefaultBenchmark()
  }
}

