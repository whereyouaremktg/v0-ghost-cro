"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Scan, Loader2, AlertCircle } from "lucide-react"
import { format, addDays, setHours, setMinutes } from "date-fns"

import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"
import { GhostSelect } from "@/components/ui/ghost-select"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useTestHistory } from "@/hooks/use-test-history"

type ScanConfig = {
  theme: boolean
  checkout: boolean
  speed: boolean
}

type Schedule = "daily" | "weekly" | "manual"

export default function ScannerPage() {
  const router = useRouter()
  const { userId } = useAuthUserId()
  const { tests: testHistory, isLoading: isLoadingHistory } = useTestHistory(userId, 20)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Scan configuration state
  const [scanConfig, setScanConfig] = useState<ScanConfig>({
    theme: true,
    checkout: true,
    speed: true,
  })
  const [schedule, setSchedule] = useState<Schedule>("daily")

  // Calculate next scheduled scan based on schedule setting
  const nextScheduledScan = useMemo(() => {
    if (schedule === "manual") return null
    const now = new Date()
    const nextScan = schedule === "daily"
      ? addDays(setMinutes(setHours(now, 9), 0), 1)
      : addDays(setMinutes(setHours(now, 9), 0), 7)
    return format(nextScan, "EEEE 'at' h:mm a")
  }, [schedule])

  // Build scan history from actual test data
  const history = useMemo(() => {
    return testHistory.map(test => ({
      id: test.id,
      date: test.created_at ? format(new Date(test.created_at), "MMM d, yyyy 'at' h:mm a") : "Unknown",
      status: test.status === "completed" ? "Completed" : test.status === "running" ? "Running" : test.status === "failed" ? "Failed" : "Pending",
      score: test.overall_score ?? undefined
    }))
  }, [testHistory])

  const handleTriggerScan = async () => {
    if (!userId) {
      setError("Please log in to run a scan")
      return
    }

    setIsScanning(true)
    setError(null)

    try {
      // API uses connected store URL when url is not sent; returns 402 if no store or no subscription
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanConfig: {
            theme: scanConfig.theme,
            checkout: scanConfig.checkout,
            speed: scanConfig.speed,
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 402) {
          const msg = data.message || data.error || 'Connect your store in Settings and ensure you have an active subscription.'
          throw new Error(msg)
        }
        throw new Error(data.error || 'Failed to start scan')
      }

      // Redirect to scanning page to show progress
      if (data.jobId) {
        router.push(`/onboarding/scanning?testId=${data.jobId}`)
      } else {
        setError('No job ID returned')
        setIsScanning(false)
      }
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scanConfig.theme}
                  onChange={(e) => setScanConfig(prev => ({ ...prev, theme: e.target.checked }))}
                  className="accent-[#FBBF24]"
                />
                Theme
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scanConfig.checkout}
                  onChange={(e) => setScanConfig(prev => ({ ...prev, checkout: e.target.checked }))}
                  className="accent-[#FBBF24]"
                />
                Checkout
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scanConfig.speed}
                  onChange={(e) => setScanConfig(prev => ({ ...prev, speed: e.target.checked }))}
                  className="accent-[#FBBF24]"
                />
                Speed
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[#9CA3AF]">Schedule</p>
            <GhostSelect
              value={schedule}
              onChange={(e) => setSchedule(e.target.value as Schedule)}
            >
              <option value="daily">Daily (Pro)</option>
              <option value="weekly">Weekly</option>
              <option value="manual">Manual only</option>
            </GhostSelect>
          </div>
          <div className="space-y-2">
            <p className="text-[#9CA3AF]">Next scheduled scan</p>
            <div className="flex items-center gap-2 text-white">
              <Calendar className="h-4 w-4 text-[#FBBF24]" />
              {nextScheduledScan || "Manual scans only"}
            </div>
          </div>
        </div>
      </GhostCard>

      <GhostCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Scan history</h3>
        <div className="space-y-3">
          {isLoadingHistory ? (
            <p className="text-sm text-[#6B7280] text-center py-4">
              Loading scan history...
            </p>
          ) : history.length === 0 ? (
            <p className="text-sm text-[#6B7280] text-center py-4">
              No scans yet. Run your first scan to see history.
            </p>
          ) : (
            history.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between rounded-lg border border-[#2A2A2A] bg-[#141414] p-4"
              >
                <div>
                  <p className="text-white">{scan.date}</p>
                  <p className={`text-xs ${
                    scan.status === "Completed" ? "text-green-400" :
                    scan.status === "Running" ? "text-[#FBBF24]" :
                    scan.status === "Failed" ? "text-red-400" :
                    "text-[#6B7280]"
                  }`}>
                    {scan.status}
                  </p>
                </div>
                {scan.score !== undefined ? (
                  <div className="text-sm text-[#FBBF24]">
                    Score {scan.score}
                  </div>
                ) : scan.status === "Running" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#FBBF24]" />
                ) : null}
              </div>
            ))
          )}
        </div>
      </GhostCard>
    </div>
  )
}
