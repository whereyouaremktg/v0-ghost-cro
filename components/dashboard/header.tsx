"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Bell, RefreshCw, Search, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import useSWR from "swr"

import { createClient } from "@/lib/supabase/client"
import { useAuthUserId } from "@/hooks/use-auth-user-id"

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/scanner": "Scanner",
  "/dashboard/issues": "Issues",
  "/dashboard/experiments": "Experiments",
  "/dashboard/insights": "Insights",
  "/dashboard/settings": "Settings",
  "/dashboard/history": "History",
}

export function DashboardHeader({ lastScan: lastScanProp }: { lastScan?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const pageTitle = titles[pathname] ?? "Dashboard"
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { userId } = useAuthUserId()

  // Fetch last scan timestamp
  const { data: lastScanData, mutate } = useSWR(
    userId ? ["last-scan", userId] : null,
    async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("tests")
        .select("created_at, status")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      return data
    }
  )

  // Format last scan time
  const lastScanTime = lastScanData?.created_at
    ? formatDistanceToNow(new Date(lastScanData.created_at), { addSuffix: true })
    : lastScanProp ?? "No scans yet"

  // Determine status indicator color
  const statusColor = lastScanData?.status === "running"
    ? "bg-[#FBBF24] animate-pulse"
    : lastScanData?.status === "failed"
      ? "bg-red-500"
      : "bg-green-500"

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Refresh both the SWR cache and the page
    mutate()
    router.refresh()
    // Reset after a short delay for visual feedback
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <header className="h-16 border-b border-[#1F1F1F] flex items-center justify-between px-6 bg-[#0A0A0A]">
      <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <div className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span>Last scan: {lastScanTime}</span>
          <button
            type="button"
            className="text-[#FBBF24] hover:text-[#F59E0B] disabled:opacity-50"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh data"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 bg-[#111111] border border-[#1F1F1F] rounded-lg text-sm text-[#9CA3AF] hover:border-[#2A2A2A]"
        >
          <Search className="w-4 h-4" />
          <span>Search...</span>
          <kbd className="text-xs bg-[#0A0A0A] px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </button>

        <button className="relative p-2 text-[#9CA3AF] hover:text-white">
          <Bell className="w-5 h-5" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-[#FBBF24] rounded-full" />
        </button>
      </div>
    </header>
  )
}
