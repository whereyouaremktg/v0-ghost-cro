"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import type { TestResult } from "@/lib/types"

export function useTestResult(testId?: string | null) {
  const supabase = createClient()

  const fetcher = async (): Promise<TestResult | null> => {
    if (!testId) {
      return null
    }

    const { data, error } = await supabase
      .from("tests")
      .select("results")
      .eq("id", testId)
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
  } = useSWR(testId ? ["test-result", testId] : null, fetcher, {
    refreshInterval: 0,
  })

  return {
    test: data ?? null,
    isLoading,
    error,
    refresh: mutate,
  }
}
