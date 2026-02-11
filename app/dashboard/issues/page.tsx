"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, SlidersHorizontal } from "lucide-react"
import useSWR from "swr"

import { EmptyState } from "@/components/ui/empty-state"
import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"
import { GhostInput } from "@/components/ui/ghost-input"
import { GhostSelect } from "@/components/ui/ghost-select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useLatestTest } from "@/hooks/use-latest-test"
import { createClient } from "@/lib/supabase/client"
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
    ...test.frictionPoints.critical.map((issue) =>
      mapIssue(issue, "critical"),
    ),
    ...test.frictionPoints.high.map((issue) => mapIssue(issue, "warning")),
    ...test.frictionPoints.medium.map((issue) =>
      mapIssue(issue, "suggestion"),
    ),
  ]
}

const mapPersistedStatusToLabel = (status?: string) => {
  if (!status) return "Open"
  if (status === "fixed") return "Fixed"
  if (status === "dismissed") return "Dismissed"
  return "Open"
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

  // Filter and sort issues
  const issues = useMemo(() => {
    let result = [...allIssues]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (issue) =>
          issue.title.toLowerCase().includes(query) ||
          issue.category.toLowerCase().includes(query)
      )
    }

    // Severity filter
    if (severityFilter) {
      result = result.filter((issue) => issue.severity === severityFilter)
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((issue) =>
        statusFilter === "open"
          ? issue.status === "Open"
          : issue.status === "Fixed" || issue.status === "Dismissed"
      )
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "severity") {
        const order = { critical: 0, warning: 1, suggestion: 2 }
        return order[a.severity] - order[b.severity]
      }
      if (sortBy === "impact") {
        const getImpactNum = (impact: string) => {
          const match = impact.match(/\d+/)
          return match ? parseInt(match[0]) : 0
        }
        return getImpactNum(b.impact) - getImpactNum(a.impact)
      }
      // Default: by title
      return a.title.localeCompare(b.title)
    })

    return result
  }, [allIssues, searchQuery, severityFilter, statusFilter, sortBy])

  const toggleFilter = (type: "severity" | "status", value: string) => {
    if (type === "severity") {
      setSeverityFilter((prev) => (prev === value ? null : value))
    } else {
      setStatusFilter((prev) => (prev === value ? null : value))
    }
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

  if (isUserLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-32" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
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
            <a href="/dashboard/onboarding">Start a scan</a>
          </GhostButton>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Issues</h2>
          <p className="text-sm text-[#9CA3AF]">
            Prioritize fixes based on impact and severity.
          </p>
        </div>
        <GhostButton variant="outline">Export report</GhostButton>
      </div>

      <GhostCard className="p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-[#6B7280]" />
            <GhostInput
              placeholder="Search issues..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <GhostSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
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
            Clear filters
          </GhostButton>
        </div>

        {selected.length > 0 && (
          <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
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

        {bulkActionError && (
          <p className="text-xs text-red-400">{bulkActionError}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => toggleFilter("severity", "critical")}
            className={`px-3 py-1 rounded-full border transition-colors ${
              severityFilter === "critical"
                ? "border-red-500 text-red-400 bg-red-500/10"
                : "border-[#1F1F1F] text-[#9CA3AF] hover:border-[#2A2A2A]"
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => toggleFilter("severity", "warning")}
            className={`px-3 py-1 rounded-full border transition-colors ${
              severityFilter === "warning"
                ? "border-[#FBBF24] text-[#FBBF24] bg-[#FBBF24]/10"
                : "border-[#1F1F1F] text-[#9CA3AF] hover:border-[#2A2A2A]"
            }`}
          >
            Warning
          </button>
          <button
            onClick={() => toggleFilter("severity", "suggestion")}
            className={`px-3 py-1 rounded-full border transition-colors ${
              severityFilter === "suggestion"
                ? "border-green-500 text-green-400 bg-green-500/10"
                : "border-[#1F1F1F] text-[#9CA3AF] hover:border-[#2A2A2A]"
            }`}
          >
            Suggestion
          </button>
          <button
            onClick={() => toggleFilter("status", "open")}
            className={`px-3 py-1 rounded-full border transition-colors ${
              statusFilter === "open"
                ? "border-blue-500 text-blue-400 bg-blue-500/10"
                : "border-[#1F1F1F] text-[#9CA3AF] hover:border-[#2A2A2A]"
            }`}
          >
            Open
          </button>
          <button
            onClick={() => toggleFilter("status", "resolved")}
            className={`px-3 py-1 rounded-full border transition-colors ${
              statusFilter === "resolved"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-[#1F1F1F] text-[#9CA3AF] hover:border-[#2A2A2A]"
            }`}
          >
            Resolved
          </button>
        </div>

        {issues.length !== allIssues.length && (
          <p className="text-xs text-[#6B7280]">
            Showing {issues.length} of {allIssues.length} issues
          </p>
        )}
      </GhostCard>

      <div className="space-y-3">
        {issues.map((issue) => (
          <GhostCard key={issue.id} className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
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
                  className="mt-1 h-4 w-4 rounded border-[#1F1F1F] bg-[#0A0A0A]"
                />
                <div>
                  <p className="text-white font-medium">{issue.title}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280] mt-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#1A1A1A]">
                      {issue.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#1A1A1A]">
                      {issue.status}
                    </span>
                    <span className="text-green-400">{issue.impact}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wide text-[#FBBF24]">
                  {issue.severity}
                </span>
                <GhostButton asChild size="sm" variant="outline">
                  <Link href={`/dashboard/issues/${issue.id}`}>
                    View details
                  </Link>
                </GhostButton>
              </div>
            </div>
          </GhostCard>
        ))}
      </div>
    </div>
  )
}
