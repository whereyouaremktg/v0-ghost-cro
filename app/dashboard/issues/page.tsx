"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, SlidersHorizontal } from "lucide-react"

import { EmptyState } from "@/components/ui/empty-state"
import { GhostButton } from "@/components/ui/ghost-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useLatestTest } from "@/hooks/use-latest-test"
import type { FrictionPoint, TestResult } from "@/lib/types"

type IssueRow = {
  id: string
  title: string
  severity: "critical" | "high" | "medium"
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
    ...test.frictionPoints.high.map((issue) => mapIssue(issue, "high")),
    ...test.frictionPoints.medium.map((issue) =>
      mapIssue(issue, "medium"),
    ),
  ]
}

export default function IssuesPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Critical" | "High" | "Medium"
  >("All")
  const { userId, isLoading: isUserLoading } = useAuthUserId()
  const { test, isLoading } = useLatestTest(userId)

  const issues = useMemo(() => (test ? mapIssues(test) : []), [test])
  const filteredIssues = useMemo(() => {
    if (activeFilter === "All") {
      return issues
    }
    return issues.filter(
      (issue) => issue.severity === activeFilter.toLowerCase(),
    )
  }, [activeFilter, issues])

  const severityStyles: Record<IssueRow["severity"], string> = {
    critical: "bg-[#EF4444]",
    high: "bg-[#F97316]",
    medium: "bg-[#FBBF24]",
  }

  const severityBadgeStyles: Record<IssueRow["severity"], string> = {
    critical: "bg-[#2A0E11] text-[#FCA5A5]",
    high: "bg-[#2B1A0E] text-[#FDBA74]",
    medium: "bg-[#2B230F] text-[#FCD34D]",
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
          <h2 className="text-xl font-semibold text-white">
            Issues Detected
          </h2>
          <p className="text-sm text-[#9CA3AF]">
            Prioritized by revenue impact.
          </p>
        </div>
        <GhostButton variant="secondary">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </GhostButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {(["All", "Critical", "High", "Medium"] as const).map((filter) => {
          const isActive = activeFilter === filter
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-4 py-2 transition ${
                isActive
                  ? "bg-[#16161A] text-white"
                  : "text-[#9CA3AF] hover:text-white"
              }`}
            >
              {filter}
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="flex items-stretch gap-4 rounded-2xl border border-transparent bg-[#0B0B0F] px-4 py-4 transition-colors hover:border-[#FBBF24]"
          >
            <div className={`w-1 rounded-full ${severityStyles[issue.severity]}`} />
            <div className="flex w-full items-center gap-3">
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
                className="h-4 w-4 rounded border-[#1F1F1F] bg-[#0A0A0A]"
              />
              <div className="grid w-full items-center gap-4 text-sm md:grid-cols-[minmax(0,1.6fr)_minmax(0,0.5fr)_minmax(0,0.5fr)_minmax(0,0.5fr)_auto]">
                <div className="space-y-1">
                  <p className="text-white font-medium">{issue.title}</p>
                  <p className="text-xs text-[#6B7280]">
                    {issue.category}
                  </p>
                </div>
                <div className="text-[#6B7280]">{issue.impact}</div>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs uppercase tracking-wide ${severityBadgeStyles[issue.severity]}`}
                >
                  {issue.severity}
                </span>
                <span className="text-xs text-[#9CA3AF]">
                  {issue.status}
                </span>
                <Link
                  href={`/dashboard/issues/${issue.id}`}
                  className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#16161A] text-white"
                  aria-label={`View ${issue.title}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
