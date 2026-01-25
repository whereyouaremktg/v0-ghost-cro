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
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl">
      <div className="flex items-center justify-between p-5 border-b border-[#1F1F1F]">
        <h2 className="font-semibold text-white">Recent Activity</h2>
        <Link
          href="/dashboard/history"
          className="text-sm text-[#9CA3AF] hover:text-[#E5E7EB]"
        >
          View log →
        </Link>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-3">
              <div className="relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
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
                  <div className="absolute top-8 left-1/2 w-px h-4 bg-[#1F1F1F] -translate-x-1/2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm text-white">{activity.title}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">
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
