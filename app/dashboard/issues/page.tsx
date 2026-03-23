"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, AlertTriangle, ArrowRight, Filter } from "lucide-react"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useLatestTest } from "@/hooks/use-latest-test"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import type { FrictionPoint } from "@/lib/types"

type Severity = "critical" | "high" | "medium"
type IssueWithSeverity = FrictionPoint & { severity: Severity }

export default function IssuesPage() {
  const { userId } = useAuthUserId()
  const { test, isLoading } = useLatestTest(userId)
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [filterSeverity, setFilterSeverity] = useState<Severity | "all">("all")

  const issues: IssueWithSeverity[] = useMemo(() => {
    if (!test) return []
    return [
      ...test.frictionPoints.critical.map((fp) => ({ ...fp, severity: "critical" as const })),
      ...test.frictionPoints.high.map((fp) => ({ ...fp, severity: "high" as const })),
      ...test.frictionPoints.medium.map((fp) => ({ ...fp, severity: "medium" as const })),
    ]
  }, [test])

  const filtered = useMemo(() => {
    let result = issues
    if (filterSeverity !== "all") {
      result = result.filter((i) => i.severity === filterSeverity)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q)
      )
    }
    return result
  }, [issues, filterSeverity, search])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    )
  }

  if (!test) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No issues found"
        description="Run a scan to identify conversion optimization opportunities."
        action={{
          label: "Run Scan",
          onClick: () => router.push("/dashboard/scanner"),
        }}
      />
    )
  }

  const severityConfig = {
    critical: { label: "Critical", variant: "critical" as const, color: "bg-[hsl(var(--critical))]" },
    high: { label: "High", variant: "warning" as const, color: "bg-[hsl(var(--warning))]" },
    medium: { label: "Medium", variant: "success" as const, color: "bg-[hsl(var(--success))]" },
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">
            {issues.length} issues found
          </h2>
          <p className="text-sm text-[hsl(var(--text-muted))]">
            From your latest scan
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-dim))]" />
          <Input
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(["all", "critical", "high", "medium"] as const).map((sev) => (
            <Button
              key={sev}
              variant={filterSeverity === sev ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterSeverity(sev)}
              className="capitalize"
            >
              {sev === "all" ? "All" : severityConfig[sev].label}
              {sev !== "all" && (
                <span className="ml-1 text-xs opacity-70">
                  {issues.filter((i) => i.severity === sev).length}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Issue list */}
      <div className="space-y-2">
        {filtered.map((issue) => {
          const config = severityConfig[issue.severity]
          return (
            <Link key={issue.id} href={`/dashboard/issues/${issue.id}`}>
              <Card className="hover:bg-[hsl(var(--surface-2))] transition-colors cursor-pointer group">
                <CardContent className="py-4 px-4 flex items-center gap-4">
                  {/* Severity indicator */}
                  <div className={`w-1 h-12 rounded-full shrink-0 ${config.color}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={config.variant} className="text-[10px]">
                        {config.label}
                      </Badge>
                      {issue.codeFix && (
                        <Badge variant="outline" className="text-[10px]">
                          Has fix
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">
                      {issue.title}
                    </p>
                    <p className="text-xs text-[hsl(var(--text-dim))] truncate mt-0.5">
                      {issue.location} {issue.impact && `· ${issue.impact}`}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="h-4 w-4 text-[hsl(var(--text-dim))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </CardContent>
              </Card>
            </Link>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-[hsl(var(--text-muted))]">
            No issues match your filters.
          </div>
        )}
      </div>
    </div>
  )
}
