"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import type { TestResult } from "@/lib/types"

export function useLatestTest(userId?: string | null) {
  const supabase = createClient()

  const fetcher = async (): Promise<TestResult | null> => {
    if (!userId) {
      return null
    }

    const { data, error } = await supabase
      .from("tests")
      .select("results")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      throw error
    }

    return (data?.results as TestResult) ?? null
  }

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR(userId ? ["latest-test", userId] : null, fetcher, {
    refreshInterval: 0,
  })

  return {
    test: data ?? null,
    isLoading,
    error,
    refresh: mutate,
  }
}
