import Link from "next/link"
import { AlertCircle, Check, Scan } from "lucide-react"

type Activity = {
  id: string
  type: "scan" | "fix" | "alert"
  title: string
  timestamp: string
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="rounded-xl border border-[#1F1F1F] bg-[#111111] card-shine">
      <div className="flex items-center justify-between p-5 border-b border-[#1F1F1F]">
        <h2 className="font-semibold text-white">Recent Activity</h2>
        <Link
          href="/dashboard/history"
          className="group flex items-center gap-1 text-sm text-[#9CA3AF] hover:text-[#E5E7EB] transition-colors duration-200"
        >
          View log
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
      <div className="p-4">
        <div className="space-y-0">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-3">
              <div className="relative flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-white/[0.06] ${
                    activity.type === "scan"
                      ? "bg-[#FBBF24]/10"
                      : activity.type === "fix"
                        ? "bg-green-500/10"
                        : "bg-red-500/10"
                  }`}
                >
                  {activity.type === "scan" && (
                    <Scan className="w-4 h-4 text-[#FBBF24]" />
                  )}
                  {activity.type === "fix" && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {activity.type === "alert" && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                {index < activities.length - 1 && (
                  <div className="w-px flex-1 min-h-4 bg-white/[0.04]" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm text-white">{activity.title}</p>
                <p className="font-mono text-[11px] text-[#6B7280] mt-0.5">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
