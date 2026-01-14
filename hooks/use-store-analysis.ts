"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export function useStoreAnalysis() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchAnalysis = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        setError("Not authenticated")
        setLoading(false)
        return
      }

      // Fetch the most recent completed test/analysis
      const { data: test, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (testError) {
        console.error("Error fetching test:", testError)
      }

      // Fetch store connection
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('shop, access_token, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle()

      if (storeError) {
        console.error("Error fetching store:", storeError)
      }

      // Fetch Shopify metrics if store is connected
      let shopifyMetrics = null
      if (store?.shop && store?.access_token) {
        try {
          const metricsResponse = await fetch('/api/shopify/metrics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              shop: store.shop,
              accessToken: store.access_token,
            }),
          })

          if (metricsResponse.ok) {
            shopifyMetrics = await metricsResponse.json()
          } else {
            console.warn("Failed to fetch Shopify metrics:", await metricsResponse.text())
          }
        } catch (metricsError) {
          console.warn("Error fetching Shopify metrics:", metricsError)
          // Don't fail the entire hook if metrics fail
        }
      }

      // Extract category from test results or default to "apparel"
      const category = test?.results?.storeAnalysis?.category || 
                      test?.results?.category || 
                      "apparel"

      // Transform test results to match expected structure
      const latestTest = test ? {
        ...test,
        ...test.results,
        date: test.created_at || test.completed_at,
        status: test.status,
      } : null

      // Transform store to match expected structure
      const storeData = store ? {
        shop: store.shop,
        access_token: store.access_token,
        is_active: store.is_active,
      } : null

      setData({
        latestTest,
        store: storeData,
        shopifyMetrics,
        category,
      })
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to fetch analysis"
      console.error("Error in fetchAnalysis:", e)
      setError(errorMessage)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchAnalysis()
  }, [fetchAnalysis])

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchAnalysis 
  }
}
