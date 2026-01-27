"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, SlidersHorizontal } from "lucide-react"

import { EmptyState } from "@/components/ui/empty-state"
import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"
import { GhostInput } from "@/components/ui/ghost-input"
import { GhostSelect } from "@/components/ui/ghost-select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useLatestTest } from "@/hooks/use-latest-test"
import type { FrictionPoint, TestResult } from "@/lib/types"

type IssueRow = {
  id: string
  title: string
  severity: "critical" | "warning" | "suggestion"
  category: string
  status: string
  impact: string
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

export default function IssuesPage() {
  const [selected, setSelected] = useState<string[]>([])
  const { userId, isLoading: isUserLoading } = useAuthUserId()
  const { test, isLoading } = useLatestTest(userId)

  const issues = useMemo(() => (test ? mapIssues(test) : []), [test])

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
        <GhostButton variant="secondary">Export report</GhostButton>
      </div>

      <GhostCard className="p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-[#6B7280]" />
            <GhostInput placeholder="Search issues..." className="pl-9" />
          </div>
          <GhostSelect defaultValue="impact">
            <option value="impact">Sort by impact</option>
            <option value="date">Newest first</option>
            <option value="severity">Severity</option>
          </GhostSelect>
          <GhostButton variant="secondary" size="sm">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </GhostButton>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {["Critical", "Warning", "Suggestion", "Open", "Resolved"].map(
            (filter) => (
              <span
                key={filter}
                className="px-3 py-1 rounded-full border border-[#1F1F1F] text-[#9CA3AF]"
              >
                {filter}
              </span>
            ),
          )}
        </div>
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
                <GhostButton asChild size="sm" variant="secondary">
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
