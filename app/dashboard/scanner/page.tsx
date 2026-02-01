"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Scan, Loader2, AlertCircle } from "lucide-react"
import { format } from "date-fns"

import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"
import { GhostSelect } from "@/components/ui/ghost-select"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useLatestTest } from "@/hooks/use-latest-test"

export default function ScannerPage() {
  const router = useRouter()
  const { userId } = useAuthUserId()
  const { test } = useLatestTest(userId)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Build scan history from actual test data
  const history = useMemo(() => {
    if (!test) return []
    return [{
      id: test.id,
      date: test.date ? format(new Date(test.date), "MMM d, yyyy 'at' h:mm a") : "Unknown",
      status: "Completed",
      score: test.score
    }]
  }, [test])

  const handleTriggerScan = async () => {
    if (!userId) {
      setError("Please log in to run a scan")
      return
    }

    // Get store URL from the latest test or redirect to connect if no store
    const storeUrl = test?.url
    if (!storeUrl) {
      setError("No store connected. Please connect your store first.")
      router.push("/dashboard/settings")
      return
    }

    setIsScanning(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: storeUrl })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error(data.message || 'Active subscription required')
        }
        throw new Error(data.error || 'Failed to start scan')
      }

      // Redirect to scanning page to show progress
      router.push(`/onboarding/scanning?testId=${data.jobId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start scan')
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-6">
      <GhostCard className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Scanner</h2>
          <p className="text-sm text-[#9CA3AF]">
            Run a new scan to detect conversion leaks and performance issues.
          </p>
          {error && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>
        <GhostButton onClick={handleTriggerScan} disabled={isScanning}>
          {isScanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Scan className="h-4 w-4" />
          )}
          {isScanning ? "Starting scan..." : "Trigger new scan"}
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
          {history.length === 0 ? (
            <p className="text-sm text-[#6B7280] text-center py-4">
              No scans yet. Run your first scan to see history.
            </p>
          ) : (
            history.map((scan) => (
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
            ))
          )}
        </div>
      </GhostCard>
    </div>
  )
}
