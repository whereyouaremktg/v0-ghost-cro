"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"

export type TestHistoryItem = {
  id: string
  status: "pending" | "running" | "completed" | "failed"
  store_url: string
  overall_score: number | null
  friction_score: number | null
  created_at: string
  completed_at: string | null
}

export function useTestHistory(userId?: string | null, limit: number = 10) {
  const supabase = createClient()

  const fetcher = async (): Promise<TestHistoryItem[]> => {
    if (!userId) {
      return []
    }

    const { data, error } = await supabase
      .from("tests")
      .select("id, status, store_url, overall_score, friction_score, created_at, completed_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return (data as TestHistoryItem[]) ?? []
  }

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR(userId ? ["test-history", userId, limit] : null, fetcher, {
    refreshInterval: 0,
  })

  return {
    tests: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  }
}
