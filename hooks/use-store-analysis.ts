"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { TestResult } from "@/lib/types"

interface StoreData {
  shop: string
  access_token: string
  is_active: boolean
}

interface ShopifyMetrics {
  metrics: {
    totalRevenue: number
    totalSessions: number
    averageOrderValue: number
    conversionRate: number | null
  }
}

interface UseStoreAnalysisReturn {
  data: {
    latestTest: TestResult | null
    store: StoreData | null
    shopifyMetrics: ShopifyMetrics | null
    category: string | null
  }
  loading: boolean
  error: string | null
  triggerScan: (url: string) => Promise<string | null> // Returns jobId or null
  refetch: () => Promise<void>
}

export function useStoreAnalysis(): UseStoreAnalysisReturn {
  const [latestTest, setLatestTest] = useState<TestResult | null>(null)
  const [store, setStore] = useState<StoreData | null>(null)
  const [shopifyMetrics, setShopifyMetrics] = useState<ShopifyMetrics | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError("Not authenticated")
        setLoading(false)
        return
      }

      // Fetch latest completed test
      const { data: tests, error: testsError } = await supabase
        .from("tests")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (testsError && testsError.code !== "PGRST116") {
        // PGRST116 is "not found" which is OK
        console.error("Error fetching tests:", testsError)
      }

      if (tests?.results) {
        setLatestTest(tests.results as TestResult)
      }

      // Fetch store connection
      const { data: stores, error: storesError } = await supabase
        .from("stores")
        .select("shop, access_token, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle()

      if (storesError) {
        console.error("Error fetching store:", storesError)
      } else if (stores) {
        setStore(stores as StoreData)

        // Fetch Shopify metrics if store is connected
        try {
          const metricsResponse = await fetch("/api/shopify/metrics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              shop: stores.shop,
              accessToken: stores.access_token,
            }),
          })

          if (metricsResponse.ok) {
            const metricsData = await metricsResponse.json()
            setShopifyMetrics(metricsData)
          }
        } catch (metricsError) {
          console.warn("Failed to fetch Shopify metrics:", metricsError)
          // Don't fail the whole hook if metrics fail
        }
      }

      // Determine category (could be enhanced with AI classification)
      // For now, default to "apparel" or extract from store URL
      setCategory("apparel")
    } catch (err) {
      console.error("Error in useStoreAnalysis:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }, [])

  const triggerScan = useCallback(async (url: string): Promise<string | null> => {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, personaMix: "balanced" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start analysis")
      }

      const data = await response.json()
      return data.jobId || null
    } catch (err) {
      console.error("Error triggering scan:", err)
      setError(err instanceof Error ? err.message : "Failed to start scan")
      return null
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data: {
      latestTest,
      store,
      shopifyMetrics,
      category,
    },
    loading,
    error,
    triggerScan,
    refetch: fetchData,
  }
}
