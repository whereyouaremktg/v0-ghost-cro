"use client"

import { useRouter } from "next/navigation"
import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useTestHistory } from "@/hooks/use-test-history"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"

export default function HistoryPage() {
  const { userId } = useAuthUserId()
  const { tests, isLoading } = useTestHistory(userId, 50)
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    )
  }

  if (tests.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No scan history"
        description="Your scan history will appear here after you run your first analysis."
        action={{
          label: "Run First Scan",
          onClick: () => router.push("/dashboard/scanner"),
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Scan History</h2>
        <p className="text-sm text-[hsl(var(--text-muted))]">
          All {tests.length} scans, most recent first.
        </p>
      </div>

      <div className="space-y-2">
        {tests.map((test) => {
          const statusIcon = {
            completed: <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />,
            failed: <XCircle className="h-4 w-4 text-[hsl(var(--critical))]" />,
            running: <Loader2 className="h-4 w-4 text-[hsl(var(--accent))] animate-spin" />,
            pending: <Clock className="h-4 w-4 text-[hsl(var(--text-dim))]" />,
          }

          return (
            <Card key={test.id} className="hover:bg-[hsl(var(--surface-2))] transition-colors cursor-pointer" onClick={() => {
              if (test.status === "completed") {
                router.push(`/dashboard/test/${test.id}`)
              }
            }}>
              <CardContent className="py-4 px-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--surface-2))] flex items-center justify-center shrink-0">
                  {statusIcon[test.status]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">
                    {test.store_url || "Store scan"}
                  </p>
                  <p className="text-xs text-[hsl(var(--text-dim))]">
                    {new Date(test.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {test.status === "completed" && test.overall_score !== null && (
                    <p className="text-lg font-semibold text-mono-data text-[hsl(var(--text-primary))]">
                      {test.overall_score}
                    </p>
                  )}
                  <Badge
                    variant={
                      test.status === "completed"
                        ? "success"
                        : test.status === "failed"
                          ? "critical"
                          : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {test.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
