"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Scan,
  DollarSign,
  ArrowRight,
  Clock,
  Activity,
} from "lucide-react"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useLatestTest } from "@/hooks/use-latest-test"
import { useTestHistory } from "@/hooks/use-test-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScoreRing } from "@/components/ui/score-ring"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"

export default function DashboardPage() {
  const { userId } = useAuthUserId()
  const { test, isLoading: testLoading } = useLatestTest(userId)
  const { tests: history, isLoading: historyLoading } = useTestHistory(userId, 5)
  const router = useRouter()

  const isLoading = testLoading || historyLoading

  const stats = useMemo(() => {
    if (!test) return null

    const criticalCount = test.frictionPoints.critical.length
    const highCount = test.frictionPoints.high.length
    const mediumCount = test.frictionPoints.medium.length
    const totalIssues = criticalCount + highCount + mediumCount

    return {
      score: test.score,
      change: test.change ?? 0,
      totalIssues,
      criticalCount,
      highCount,
      mediumCount,
      scanCount: history.length,
    }
  }, [test, history])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!test) {
    return (
      <EmptyState
        icon={Scan}
        title="No scans yet"
        description="Run your first scan to see your store health score and optimization opportunities."
        action={{
          label: "Run First Scan",
          onClick: () => router.push("/dashboard/scanner"),
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Score Hero + KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Hero */}
        <Card className="lg:col-span-1 card-interactive">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <ScoreRing score={stats!.score} size={140} />
            <div className="mt-4">
              <p className="text-sm text-[hsl(var(--text-muted))]">Store Health</p>
              {stats!.change !== 0 && (
                <div className={`flex items-center justify-center gap-1 mt-1 text-sm ${
                  stats!.change > 0 ? "text-[hsl(var(--success))]" : "text-[hsl(var(--critical))]"
                }`}>
                  {stats!.change > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {stats!.change > 0 ? "+" : ""}{stats!.change} pts
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4"
              onClick={() => router.push("/dashboard/scanner")}
            >
              Run New Scan
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <KPICard
            label="Issues Found"
            value={stats!.totalIssues.toString()}
            icon={AlertTriangle}
            detail={
              <div className="flex gap-1.5 mt-1.5">
                {stats!.criticalCount > 0 && <Badge variant="critical">{stats!.criticalCount} critical</Badge>}
                {stats!.highCount > 0 && <Badge variant="warning">{stats!.highCount} high</Badge>}
              </div>
            }
          />
          <KPICard
            label="Scans Completed"
            value={stats!.scanCount.toString()}
            icon={Scan}
          />
          <KPICard
            label="Working Well"
            value={test.frictionPoints.working.length.toString()}
            icon={TrendingUp}
            detail={
              <span className="text-xs text-[hsl(var(--success))]">positive signals</span>
            }
          />
          <KPICard
            label="Persona Mix"
            value={test.personaMix || "balanced"}
            icon={Activity}
            valueSmall
          />
        </div>
      </div>

      {/* Two column: Insights + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Issues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Top Issues</CardTitle>
            <Link href="/dashboard/issues" className="text-xs text-[hsl(var(--accent))] hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...test.frictionPoints.critical.slice(0, 2), ...test.frictionPoints.high.slice(0, 3)]
              .slice(0, 5)
              .map((issue, i) => {
                const isCritical = test.frictionPoints.critical.includes(issue)
                return (
                  <Link
                    key={i}
                    href={`/dashboard/issues/${issue.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--surface-2))] transition-colors group"
                  >
                    <div
                      className={`w-1.5 h-8 rounded-full shrink-0 ${
                        isCritical ? "bg-[hsl(var(--critical))]" : "bg-[hsl(var(--warning))]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[hsl(var(--text-primary))] truncate">{issue.title}</p>
                      <p className="text-xs text-[hsl(var(--text-dim))] truncate">{issue.location}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[hsl(var(--text-dim))] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                )
              })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Scans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--surface-2))] flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-[hsl(var(--text-dim))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[hsl(var(--text-secondary))] truncate">
                    {item.store_url || "Store scan"}
                  </p>
                  <p className="text-xs text-[hsl(var(--text-dim))]">
                    {new Date(item.created_at).toLocaleDateString()} &middot;{" "}
                    {item.status === "completed" ? (
                      <span className="text-[hsl(var(--success))]">Score: {item.overall_score}</span>
                    ) : (
                      <span className="text-[hsl(var(--warning))]">{item.status}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-sm text-[hsl(var(--text-dim))] text-center py-4">
                No scans yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KPICard({
  label,
  value,
  icon: Icon,
  detail,
  valueSmall,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  detail?: React.ReactNode
  valueSmall?: boolean
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-2">
          <span className="label-uppercase">{label}</span>
          <Icon className="h-4 w-4 text-[hsl(var(--text-dim))]" />
        </div>
        <p className={`font-semibold text-[hsl(var(--text-primary))] ${valueSmall ? "text-lg capitalize" : "text-2xl text-mono-data"}`}>
          {value}
        </p>
        {detail}
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64" />
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}
