"use client"

import { GhostCard } from "@/components/ui/ghost-card"

const log = [
  { id: "1", title: "Scan completed", time: "2 hours ago" },
  { id: "2", title: "Issue marked fixed: Sticky CTA", time: "Yesterday" },
  { id: "3", title: "GA4 connected", time: "Oct 2, 2024" },
]

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">History</h2>
        <p className="text-sm text-[#9CA3AF]">
          Full activity log for your workspace.
        </p>
      </div>

      <GhostCard className="p-6 space-y-3">
        {log.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between border-b border-[#1F1F1F] pb-3 last:border-b-0 last:pb-0"
          >
            <span className="text-white">{entry.title}</span>
            <span className="text-xs text-[#6B7280]">{entry.time}</span>
          </div>
        ))}
      </GhostCard>
    </div>
  )
}
