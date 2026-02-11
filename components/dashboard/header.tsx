"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Bell, RefreshCw, Search, Loader2 } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import useSWR from "swr"

import { createClient } from "@/lib/supabase/client"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { GhostInput } from "@/components/ui/ghost-input"

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/scanner": "Scanner",
  "/dashboard/issues": "Issues",
  "/dashboard/experiments": "Experiments",
  "/dashboard/insights": "Insights",
  "/dashboard/settings": "Settings",
  "/dashboard/history": "History",
}

type SearchTest = {
  id: string
  store_url: string
  created_at: string
  status: "pending" | "running" | "completed" | "failed"
}

export function DashboardHeader({ lastScan: lastScanProp }: { lastScan?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const pageTitle = titles[pathname] ?? "Dashboard"
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
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

  const { data: searchHistory = [] } = useSWR(
    userId ? ["header-search-history", userId] : null,
    async (): Promise<SearchTest[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("tests")
        .select("id, store_url, created_at, status")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) {
        throw error
      }

      return (data as SearchTest[]) ?? []
    },
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

  const filteredSearchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return searchHistory.slice(0, 8)
    }

    return searchHistory
      .filter((test) => {
        const urlMatch = test.store_url?.toLowerCase().includes(query)
        const dateMatch = test.created_at
          ? format(new Date(test.created_at), "MMM d, yyyy h:mm a").toLowerCase().includes(query)
          : false
        return urlMatch || dateMatch
      })
      .slice(0, 8)
  }, [searchHistory, searchQuery])

  const closeSearch = () => {
    setIsSearchOpen(false)
    setSearchQuery("")
    setHighlightedIndex(0)
  }

  const handleResultSelect = (id: string) => {
    closeSearch()
    router.push(`/dashboard/test/${id}`)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isOpenCommand = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"
      if (isOpenCommand) {
        event.preventDefault()
        setIsSearchOpen(true)
        return
      }

      if (event.key === "Escape") {
        closeSearch()
        return
      }

      if (!isSearchOpen || filteredSearchResults.length === 0) {
        return
      }

      if (event.key === "ArrowDown") {
        event.preventDefault()
        setHighlightedIndex((prev) => Math.min(prev + 1, filteredSearchResults.length - 1))
      }

      if (event.key === "ArrowUp") {
        event.preventDefault()
        setHighlightedIndex((prev) => Math.max(prev - 1, 0))
      }

      if (event.key === "Enter") {
        event.preventDefault()
        const activeResult = filteredSearchResults[highlightedIndex]
        if (activeResult) {
          handleResultSelect(activeResult.id)
        }
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [filteredSearchResults, highlightedIndex, isSearchOpen])

  useEffect(() => {
    if (!isSearchOpen) {
      return
    }

    const onClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        closeSearch()
      }
    }

    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [isSearchOpen])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [searchQuery])

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

        <div ref={searchRef} className="relative">
          {isSearchOpen ? (
            <GhostInput
              autoFocus
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by store URL or date..."
              className="w-[360px] h-10"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#111111] border border-[#1F1F1F] rounded-lg text-sm text-[#9CA3AF] hover:border-[#2A2A2A]"
            >
              <Search className="w-4 h-4" />
              <span>Search...</span>
              <kbd className="text-xs bg-[#0A0A0A] px-1.5 py-0.5 rounded">⌘K</kbd>
            </button>
          )}

          {isSearchOpen && (
            <div className="absolute right-0 top-12 w-[420px] max-h-80 overflow-auto rounded-lg border border-[#1F1F1F] bg-[#111111] shadow-xl z-50">
              {filteredSearchResults.length === 0 ? (
                <p className="px-4 py-3 text-sm text-[#6B7280]">No matching scans found.</p>
              ) : (
                filteredSearchResults.map((result, index) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleResultSelect(result.id)}
                    className={`w-full text-left px-4 py-3 border-b border-[#1F1F1F] last:border-0 ${
                      index === highlightedIndex ? "bg-[#161616]" : "hover:bg-[#161616]"
                    }`}
                  >
                    <p className="text-sm text-white truncate">{result.store_url}</p>
                    <p className="text-xs text-[#6B7280]">
                      {format(new Date(result.created_at), "MMM d, yyyy h:mm a")} • {result.status}
                    </p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button className="relative p-2 text-[#9CA3AF] hover:text-white">
          <Bell className="w-5 h-5" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-[#FBBF24] rounded-full" />
        </button>
      </div>
    </header>
  )
}
