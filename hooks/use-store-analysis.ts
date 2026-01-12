"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function useStoreAnalysis() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch the most recent completed test/analysis
        const { data: test } = await supabase
          .from('tests')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        // Also fetch store connection
        const { data: store } = await supabase
          .from('stores')
          .select('shop, access_token, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle()

        setData({
          test,
          store_url: store?.shop ? `https://${store.shop}` : null,
          ...test?.results,
        })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [])

  return { data, loading }
}
