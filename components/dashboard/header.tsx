"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Bell, RefreshCw, Search, Loader2 } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import useSWR from "swr"

import { createClient } from "@/lib/supabase/client"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { GhostInput } from "@/components/ui/ghost-input"
import { GhostButton } from "@/components/ui/ghost-button"
import { StoreSelector, type StoreData } from "./store-selector"

type SearchTest = {
  id: string
  store_url: string
  created_at: string
  status: "pending" | "running" | "completed" | "failed"
}

type StoreRow = {
  id: string
  shop: string | null
  name: string | null
}

type SubscriptionRow = {
  plan: string | null
  tests_limit: number | null
  tests_used: number | null
}

function resolvePageTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard/issues/")) return "Issue Details"
  if (pathname.startsWith("/dashboard/test/")) return "Scan Results"

  const titles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/scanner": "Scanner",
    "/dashboard/issues": "Issues",
    "/dashboard/history": "History",
    "/dashboard/experiments": "Experiments",
    "/dashboard/insights": "Insights",
    "/dashboard/settings": "Settings",
  }

  return titles[pathname] ?? "Dashboard"
}

function formatPlanName(plan: string | null | undefined): string {
  if (!plan) return "Free"
  const normalized = plan === "pro" ? "growth" : plan
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export function DashboardHeader({ lastScan: lastScanProp }: { lastScan?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pageTitle = resolvePageTitle(pathname)

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)

  const { userId } = useAuthUserId()

  const { data: currentUser } = useSWR("header-current-user", async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    return user
  })

  const { data: storesData, mutate: mutateStores } = useSWR(
    currentUser?.id ? `header-stores-${currentUser.id}` : null,
    async (): Promise<StoreRow[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("stores")
        .select("id, shop, name")
        .eq("user_id", currentUser!.id)
        .eq("is_active", true)

      if (error) {
        throw error
      }

      return (data as StoreRow[]) ?? []
    },
    { revalidateOnFocus: true },
  )

  const stores: StoreData[] =
    storesData?.map((store) => ({
      id: store.id,
      name: store.name || store.shop?.replace(".myshopify.com", "") || "Store",
      domain: store.shop || "",
    })) ?? []

  const currentStore = stores[0] || null

  const { data: subscription } = useSWR(
    currentUser?.id ? `header-subscription-${currentUser.id}` : null,
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("subscriptions")
        .select("plan, tests_limit, tests_used")
        .eq("user_id", currentUser!.id)
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      return (data as SubscriptionRow | null) ?? null
    },
  )

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
    },
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

  useEffect(() => {
    if (searchParams.get("store_connected") !== "1") return

    mutateStores().then(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("store_connected")
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }, [searchParams, mutateStores, pathname, router])

  useEffect(() => {
    if (pathname?.startsWith("/dashboard")) {
      mutateStores()
    }
  }, [pathname, mutateStores])

  const lastScanTime = lastScanData?.created_at
    ? formatDistanceToNow(new Date(lastScanData.created_at), { addSuffix: true })
    : lastScanProp ?? "No scans yet"

  const statusColor =
    lastScanData?.status === "running"
      ? "bg-[#FBBF24] animate-pulse"
      : lastScanData?.status === "failed"
        ? "bg-red-500"
        : "bg-green-500"

  const scansRemaining = Math.max(
    (subscription?.tests_limit ?? 0) - (subscription?.tests_used ?? 0),
    0,
  )

  const userInitials = currentUser?.email?.slice(0, 2).toUpperCase() || "GC"

  const filteredSearchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return searchHistory.slice(0, 8)
    }

    return searchHistory
      .filter((test) => {
        const urlMatch = test.store_url?.toLowerCase().includes(query)
        const dateMatch = test.created_at
          ? format(new Date(test.created_at), "MMM d, yyyy h:mm a")
              .toLowerCase()
              .includes(query)
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

  const handleRefresh = () => {
    setIsRefreshing(true)
    mutate()
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true)

    try {
      const response = await fetch("/api/shopify/billing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      })
      const data = await response.json()
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl
      }
    } catch (error) {
      console.error("Failed to initiate upgrade", error)
    } finally {
      setIsUpgrading(false)
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isOpenCommand =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"

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
        setHighlightedIndex((prev) =>
          Math.min(prev + 1, filteredSearchResults.length - 1),
        )
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
    <header className="sticky top-0 z-30 border-b border-[#1A1A1A] bg-[#0A0A0A]/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <h1 className="truncate text-lg font-semibold tracking-tight text-white">{pageTitle}</h1>

          <div className="hidden items-center gap-2 text-xs text-[#9CA3AF] lg:flex">
            <div className={`h-2 w-2 rounded-full ${statusColor}`} />
            <span>Last scan: {lastScanTime}</span>
            <button
              type="button"
              className="text-[#FBBF24] hover:text-[#F59E0B] disabled:opacity-50"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh data"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="hidden min-w-[240px] xl:block">
            <StoreSelector currentStore={currentStore} stores={stores} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-[#1F1F1F] bg-[#111111] px-3 py-1.5 text-xs lg:flex">
            <span className="font-medium text-white">{formatPlanName(subscription?.plan)}</span>
            <span className="h-1 w-1 rounded-full bg-[#333]" />
            <span className="text-[#6B7280] tabular-nums">{scansRemaining} left</span>
          </div>

          <GhostButton
            size="sm"
            variant="outline"
            className="hidden lg:flex"
            onClick={handleUpgrade}
            disabled={isUpgrading}
          >
            {isUpgrading ? "Processing..." : "Upgrade"}
          </GhostButton>

          <div ref={searchRef} className="relative hidden md:block">
            {isSearchOpen ? (
              <GhostInput
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search scans..."
                className="h-10 w-[320px]"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-[#1F1F1F] bg-[#111111] px-3 py-1.5 text-sm text-[#9CA3AF] hover:border-[#2A2A2A]"
              >
                <Search className="h-4 w-4" />
                <span>Search...</span>
                <kbd className="rounded bg-[#0A0A0A] px-1.5 py-0.5 font-mono text-[10px] text-[#6B7280]">⌘K</kbd>
              </button>
            )}

            {isSearchOpen && (
              <div className="absolute right-0 top-12 z-50 max-h-80 w-[420px] overflow-auto rounded-lg border border-[#1F1F1F] bg-[#111111] shadow-xl ring-1 ring-white/[0.05]">
                {filteredSearchResults.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-[#6B7280]">No matching scans found.</p>
                ) : (
                  filteredSearchResults.map((result, index) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => handleResultSelect(result.id)}
                      className={`w-full border-b border-[#1F1F1F] px-4 py-3 text-left last:border-0 ${
                        index === highlightedIndex ? "bg-[#161616]" : "hover:bg-[#161616]"
                      }`}
                    >
                      <p className="truncate text-sm text-white">{result.store_url}</p>
                      <p className="text-xs text-[#6B7280]">
                        {format(new Date(result.created_at), "MMM d, yyyy h:mm a")} • {result.status}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button className="relative rounded-lg p-2 text-[#9CA3AF] hover:bg-[#111111] hover:text-white transition-colors duration-200">
            <Bell className="h-5 w-5" />
            <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#FBBF24] ring-2 ring-[#0A0A0A]" />
          </button>

          <Link
            href="/dashboard/settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111111] text-sm font-semibold text-white ring-1 ring-white/[0.06] hover:ring-[#FBBF24]/30 transition-all duration-200"
          >
            {userInitials}
          </Link>
        </div>
      </div>
    </header>
  )
}
