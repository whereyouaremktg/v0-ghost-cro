"use client"

import { formatDistanceToNow, format } from "date-fns"
import { Scan, CheckCircle, AlertCircle, Clock } from "lucide-react"

import { GhostCard } from "@/components/ui/ghost-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useTestHistory } from "@/hooks/use-test-history"

const statusConfig = {
  completed: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/10",
    label: "Completed",
  },
  failed: {
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    label: "Failed",
  },
  running: {
    icon: Scan,
    color: "text-[#FBBF24]",
    bg: "bg-[#FBBF24]/10",
    label: "Running",
  },
  pending: {
    icon: Clock,
    color: "text-[#9CA3AF]",
    bg: "bg-[#9CA3AF]/10",
    label: "Pending",
  },
}

export default function HistoryPage() {
  const { userId, isLoading: isUserLoading } = useAuthUserId()
  const { tests, isLoading } = useTestHistory(userId, 50)

  if (isUserLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">History</h2>
          <p className="text-sm text-[#9CA3AF]">
            Full activity log for your workspace.
          </p>
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">History</h2>
        <p className="text-sm text-[#9CA3AF]">
          Full activity log for your workspace.
        </p>
      </div>

      <GhostCard className="p-6">
        {tests.length === 0 ? (
          <p className="text-sm text-[#6B7280] text-center py-8">
            No activity yet. Run your first scan to see history.
          </p>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => {
              const status = statusConfig[test.status] || statusConfig.pending
              const StatusIcon = status.icon

              return (
                <div
                  key={test.id}
                  className="flex items-center justify-between border-b border-[#1F1F1F] pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status.bg}`}>
                      <StatusIcon className={`w-4 h-4 ${status.color}`} />
                    </div>
                    <div>
                      <p className="text-white">
                        Scan {status.label.toLowerCase()}
                        {test.overall_score !== null && test.status === "completed" && (
                          <span className="text-[#FBBF24] ml-2">
                            Score: {test.overall_score}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {test.store_url || "Store analysis"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#9CA3AF]">
                      {test.created_at
                        ? formatDistanceToNow(new Date(test.created_at), { addSuffix: true })
                        : "Unknown"}
                    </p>
                    {test.created_at && (
                      <p className="text-xs text-[#6B7280]">
                        {format(new Date(test.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </GhostCard>
    </div>
  )
}
