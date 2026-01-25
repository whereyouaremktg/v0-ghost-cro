"use client"

import { Calendar, Scan } from "lucide-react"

import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"
import { GhostSelect } from "@/components/ui/ghost-select"

const history = [
  { id: "scan-1", date: "Today 9:42 AM", status: "Completed", score: 72 },
  { id: "scan-2", date: "Yesterday 2:10 PM", status: "Completed", score: 66 },
  { id: "scan-3", date: "Oct 2, 2024", status: "Completed", score: 64 },
]

export default function ScannerPage() {
  return (
    <div className="space-y-6">
      <GhostCard className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Scanner</h2>
          <p className="text-sm text-[#9CA3AF]">
            Run a new scan to detect conversion leaks and performance issues.
          </p>
        </div>
        <GhostButton>
          <Scan className="h-4 w-4" />
          Trigger new scan
        </GhostButton>
      </GhostCard>

      <GhostCard className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Scan configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-[#9CA3AF]">What to scan</p>
            <div className="flex flex-col gap-2 text-white">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                Theme
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                Checkout
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                Speed
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[#9CA3AF]">Schedule</p>
            <GhostSelect defaultValue="daily">
              <option value="daily">Daily (Pro)</option>
              <option value="weekly">Weekly</option>
              <option value="manual">Manual only</option>
            </GhostSelect>
          </div>
          <div className="space-y-2">
            <p className="text-[#9CA3AF]">Next scheduled scan</p>
            <div className="flex items-center gap-2 text-white">
              <Calendar className="h-4 w-4 text-[#FBBF24]" />
              Tomorrow at 9:00 AM
            </div>
          </div>
        </div>
      </GhostCard>

      <GhostCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Scan history</h3>
        <div className="space-y-3">
          {history.map((scan) => (
            <div
              key={scan.id}
              className="flex items-center justify-between rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-4"
            >
              <div>
                <p className="text-white">{scan.date}</p>
                <p className="text-xs text-[#6B7280]">{scan.status}</p>
              </div>
              <div className="text-sm text-[#FBBF24]">
                Score {scan.score}
              </div>
            </div>
          ))}
        </div>
      </GhostCard>
    </div>
  )
}
