"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, SlidersHorizontal } from "lucide-react"
import useSWR from "swr"

import { EmptyState } from "@/components/ui/empty-state"
import { GhostButton } from "@/components/ui/ghost-button"
import { GhostInput } from "@/components/ui/ghost-input"
import { GhostSelect } from "@/components/ui/ghost-select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useLatestTest } from "@/hooks/use-latest-test"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { FrictionPoint, TestResult } from "@/lib/types"

type IssueRow = {
  id: string
  title: string
  severity: "critical" | "warning" | "suggestion"
  category: string
  status: string
  impact: string
}

type IssueStatusRow = {
  issue_id: string
  status: string
}

const impactFromText = (impact?: string) => {
  if (!impact) {
    return "—"
  }

  const match = impact.match(/\d+%?/)
  return match ? `+${match[0]} lift` : impact
}

const mapIssues = (test: TestResult): IssueRow[] => {
  const mapIssue = (
    issue: FrictionPoint,
    severity: IssueRow["severity"],
  ) => ({
    id: issue.id,
    title: issue.title,
    severity,
    category: issue.location || "General",
    status: "Open",
    impact: impactFromText(issue.impact),
  })

  return [
    ...test.frictionPoints.critical.map((issue) => mapIssue(issue, "critical")),
    ...test.frictionPoints.high.map((issue) => mapIssue(issue, "warning")),
    ...test.frictionPoints.medium.map((issue) => mapIssue(issue, "suggestion")),
  ]
}

const mapPersistedStatusToLabel = (status?: string) => {
  if (!status) return "Open"
  if (status === "fixed") return "Fixed"
  if (status === "dismissed") return "Dismissed"
  return "Open"
}

function severityChipClass(severity: IssueRow["severity"]): string {
  if (severity === "critical") {
    return "border-red-500/30 bg-red-500/10 text-red-300"
  }

  if (severity === "warning") {
    return "border-[#FBBF24]/30 bg-[#FBBF24]/10 text-[#FBBF24]"
  }

  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
}

function statusChipClass(status: string): string {
  if (status === "Fixed") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
  }

  if (status === "Dismissed") {
    return "border-zinc-500/40 bg-zinc-500/10 text-zinc-300"
  }

  return "border-blue-500/30 bg-blue-500/10 text-blue-300"
}

export default function IssuesPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("severity")
  const [severityFilter, setSeverityFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [bulkActionLoading, setBulkActionLoading] = useState<"fixed" | "dismissed" | null>(null)
  const [bulkActionError, setBulkActionError] = useState<string | null>(null)

  const { userId, isLoading: isUserLoading } = useAuthUserId()
  const { test, isLoading } = useLatestTest(userId)

  const { data: persistedStatuses = [], mutate: mutatePersistedStatuses } = useSWR(
    userId && test?.id ? ["issue-status", userId, test.id] : null,
    async (): Promise<IssueStatusRow[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("issue_status")
        .select("issue_id, status")
        .eq("user_id", userId!)
        .eq("test_id", test!.id)

      if (error) {
        throw error
      }

      return (data as IssueStatusRow[]) ?? []
    },
  )

  const allIssues = useMemo(() => {
    if (!test) {
      return []
    }

    const statusByIssueId = new Map(
      persistedStatuses.map((entry) => [entry.issue_id, mapPersistedStatusToLabel(entry.status)]),
    )

    return mapIssues(test).map((issue) => ({
      ...issue,
      status: statusByIssueId.get(issue.id) ?? "Open",
    }))
  }, [persistedStatuses, test])

  const issues = useMemo(() => {
    let result = [...allIssues]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (issue) =>
          issue.title.toLowerCase().includes(query) ||
          issue.category.toLowerCase().includes(query),
      )
    }

    if (severityFilter) {
      result = result.filter((issue) => issue.severity === severityFilter)
    }

    if (statusFilter) {
      result = result.filter((issue) =>
        statusFilter === "open"
          ? issue.status === "Open"
          : issue.status === "Fixed" || issue.status === "Dismissed",
      )
    }

    result.sort((a, b) => {
      if (sortBy === "severity") {
        const order = { critical: 0, warning: 1, suggestion: 2 }
        return order[a.severity] - order[b.severity]
      }

      if (sortBy === "impact") {
        const getImpactNum = (impact: string) => {
          const match = impact.match(/\d+/)
          return match ? Number.parseInt(match[0], 10) : 0
        }

        return getImpactNum(b.impact) - getImpactNum(a.impact)
      }

      return a.title.localeCompare(b.title)
    })

    return result
  }, [allIssues, searchQuery, severityFilter, statusFilter, sortBy])

  const toggleFilter = (type: "severity" | "status", value: string) => {
    if (type === "severity") {
      setSeverityFilter((prev) => (prev === value ? null : value))
      return
    }

    setStatusFilter((prev) => (prev === value ? null : value))
  }

  const handleBulkStatusUpdate = async (status: "fixed" | "dismissed") => {
    if (!test?.id || selected.length === 0) {
      return
    }

    setBulkActionLoading(status)
    setBulkActionError(null)

    try {
      const responses = await Promise.all(
        selected.map((issueId) =>
          fetch(`/api/issues/${issueId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ test_id: test.id, status }),
          }),
        ),
      )

      const failed = responses.find((response) => !response.ok)
      if (failed) {
        throw new Error("Failed to update one or more issues")
      }

      await mutatePersistedStatuses()
      setSelected([])
    } catch (error) {
      console.error("Bulk issue update failed:", error)
      setBulkActionError("Could not update selected issues. Please try again.")
    } finally {
      setBulkActionLoading(null)
    }
  }

  const isAllVisibleSelected =
    issues.length > 0 && issues.every((issue) => selected.includes(issue.id))

  if (isUserLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-20" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <EmptyState
        icon={SlidersHorizontal}
        title="No issues yet"
        description="Run a scan to populate your issue backlog."
        action={
          <GhostButton asChild>
            <a href="/dashboard/scanner">Start a scan</a>
          </GhostButton>
        }
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-white">Issues</h2>
          <span className="rounded-full border border-[#FBBF24]/30 bg-[#FBBF24]/10 px-2.5 py-1 text-xs font-semibold text-[#FBBF24]">
            {allIssues.length}
          </span>
        </div>
        <GhostButton variant="outline">Export Report</GhostButton>
      </div>

      <div className="rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] p-4">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-[#6B7280]" />
            <GhostInput
              placeholder="Search by title or location..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <GhostSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="severity">Sort by severity</option>
            <option value="impact">Sort by impact</option>
            <option value="name">Sort by name</option>
          </GhostSelect>

          <GhostButton
            variant="outline"
            size="sm"
            onClick={() => {
              setSeverityFilter(null)
              setStatusFilter(null)
              setSearchQuery("")
            }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Clear Filters
          </GhostButton>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => toggleFilter("severity", "critical")}
            className={cn(
              "rounded-full border px-3 py-1 font-medium transition-all duration-200",
              severityFilter === "critical"
                ? "border-red-500/30 bg-red-500/10 text-red-300 shadow-[inset_0_1px_4px_rgba(239,68,68,0.1)]"
                : "border-[#1F1F1F] text-[#9CA3AF] hover:border-[#2A2A2A]",
            )}
          >
            Critical
          </button>
          <button
            onClick={() => toggleFilter("severity", "warning")}
            className={cn(
              "rounded-full border px-3 py-1 font-medium transition-all duration-200",
              severityFilter === "warning"
                ? "border-[#FBBF24]/30 bg-[#FBBF24]/10 text-[#FBBF24] shadow-[inset_0_1px_4px_rgba(251,191,36,0.1)]"
                : "border-[#1F1F1F] text-[#9CA3AF] hover:border-[#2A2A2A]",
            )}
          >
            Warning
          </button>
          <button
            onClick={() => toggleFilter("severity", "suggestion")}
            className={cn(
              "rounded-full border px-3 py-1 font-medium transition-all duration-200",
              severityFilter === "suggestion"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[inset_0_1px_4px_rgba(16,185,129,0.1)]"
                : "border-[#1F1F1F] text-[#9CA3AF] hover:border-[#2A2A2A]",
            )}
          >
            Suggestion
          </button>

          <button
            onClick={() => toggleFilter("status", "open")}
            className={cn(
              "rounded-full border px-3 py-1 font-medium transition-all duration-200",
              statusFilter === "open"
                ? "border-blue-500/30 bg-blue-500/10 text-blue-300 shadow-[inset_0_1px_4px_rgba(59,130,246,0.1)]"
                : "border-[#1F1F1F] text-[#9CA3AF] hover:border-[#2A2A2A]",
            )}
          >
            Open
          </button>
          <button
            onClick={() => toggleFilter("status", "resolved")}
            className={cn(
              "rounded-full border px-3 py-1 font-medium transition-all duration-200",
              statusFilter === "resolved"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[inset_0_1px_4px_rgba(16,185,129,0.1)]"
                : "border-[#1F1F1F] text-[#9CA3AF] hover:border-[#2A2A2A]",
            )}
          >
            Resolved
          </button>
        </div>

        {selected.length > 0 && (
          <div className="mt-3 flex flex-col gap-3 rounded-xl border border-[#1A1A1A] bg-[#111111] p-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-[#9CA3AF]">
              {selected.length} issue{selected.length === 1 ? "" : "s"} selected
            </p>
            <div className="flex flex-wrap gap-2">
              <GhostButton
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusUpdate("fixed")}
                disabled={bulkActionLoading !== null}
              >
                {bulkActionLoading === "fixed" ? "Updating..." : "Mark as Fixed"}
              </GhostButton>
              <GhostButton
                variant="ghost"
                size="sm"
                onClick={() => handleBulkStatusUpdate("dismissed")}
                disabled={bulkActionLoading !== null}
              >
                {bulkActionLoading === "dismissed" ? "Updating..." : "Dismiss"}
              </GhostButton>
            </div>
          </div>
        )}

        {bulkActionError && <p className="mt-3 text-xs text-red-400">{bulkActionError}</p>}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#1A1A1A] bg-[#0F0F0F]">
        <div className="flex items-center justify-between border-b border-[#1A1A1A] px-4 py-3">
          <button
            type="button"
            className="rounded border border-[#1F1F1F] px-2 py-1 text-[10px] text-[#9CA3AF] hover:border-[#2A2A2A] transition-colors"
            onClick={() => {
              if (isAllVisibleSelected) {
                setSelected([])
              } else {
                setSelected(issues.map((issue) => issue.id))
              }
            }}
          >
            {isAllVisibleSelected ? "Clear" : "Select all"}
          </button>
          <p className="text-[11px] uppercase tracking-widest font-medium text-[#71717A]">
            Showing {issues.length} of {allIssues.length}
          </p>
        </div>

        <div className="divide-y divide-[#141414]">
          {issues.map((issue) => {
            const severityColor =
              issue.severity === "critical"
                ? "bg-red-500"
                : issue.severity === "warning"
                  ? "bg-[#FBBF24]"
                  : "bg-emerald-500"

            return (
              <div
                key={issue.id}
                className="group relative flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-[#111111] md:flex-row md:items-center md:justify-between"
              >
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-[2px] rounded-r-full",
                    severityColor,
                  )}
                />

                <div className="flex min-w-0 items-start gap-3 pl-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(issue.id)}
                    onChange={(event) =>
                      setSelected((prev) =>
                        event.target.checked
                          ? [...prev, issue.id]
                          : prev.filter((id) => id !== issue.id),
                      )
                    }
                    className="mt-1 h-4 w-4 rounded border-[#1F1F1F] bg-[#0A0A0A] accent-[#FBBF24]"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{issue.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full border border-[#1F1F1F] bg-[#111111] px-2.5 py-1 text-[#9CA3AF]">
                        {issue.category}
                      </span>
                      <span className={cn("rounded-full border px-2.5 py-1 font-medium", severityChipClass(issue.severity))}>
                        {issue.severity}
                      </span>
                      <span className={cn("rounded-full border px-2.5 py-1 font-medium", statusChipClass(issue.status))}>
                        {issue.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#FBBF24] text-mono-data">{issue.impact}</span>
                  <GhostButton asChild size="sm" variant="ghost">
                    <Link href={`/dashboard/issues/${issue.id}`} className="group/link flex items-center gap-1">
                      Details
                      <span className="transition-transform duration-200 group-hover/link:translate-x-0.5">→</span>
                    </Link>
                  </GhostButton>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
