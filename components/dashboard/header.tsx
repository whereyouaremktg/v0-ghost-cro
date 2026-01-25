"use client"

import { usePathname } from "next/navigation"
import { Bell, RefreshCw, Search } from "lucide-react"

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/scanner": "Scanner",
  "/dashboard/issues": "Issues",
  "/dashboard/experiments": "Experiments",
  "/dashboard/insights": "Insights",
  "/dashboard/settings": "Settings",
  "/dashboard/history": "History",
}

export function DashboardHeader({ lastScan }: { lastScan?: string }) {
  const pathname = usePathname()
  const pageTitle = titles[pathname] ?? "Dashboard"

  return (
    <header className="h-16 border-b border-[#1F1F1F] flex items-center justify-between px-6 bg-[#0A0A0A]">
      <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Last scan: {lastScan ?? "2 hours ago"}</span>
          <button
            type="button"
            className="text-[#FBBF24] hover:text-[#F59E0B]"
          >
            <RefreshCw className="w-4 h-4" />
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
