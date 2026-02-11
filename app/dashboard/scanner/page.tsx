"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Scan, Loader2, AlertCircle } from "lucide-react"
import { format } from "date-fns"

import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useLatestTest } from "@/hooks/use-latest-test"

export default function ScannerPage() {
  const router = useRouter()
  const { userId } = useAuthUserId()
  const { test } = useLatestTest(userId)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanConfig, setScanConfig] = useState({
    analyzeTheme: true,
    analyzeCheckout: true,
    analyzeSpeed: true,
  })

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

  const shouldShowSettingsLink =
    typeof error === "string" && /subscription|shopify store|connect/i.test(error)

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
        body: JSON.stringify({ config: scanConfig })
      })

      const data = await response
        .json()
        .catch(() => ({ error: "Unexpected response from analyze API" }))

      if (!response.ok) {
        if (response.status === 402) {
          const msg =
            data.message ||
            data.error ||
            "Complete setup required: connect your Shopify store in Settings and activate a billing plan before running scans."
          throw new Error(msg)
        }
        if (response.status === 429) {
          const retryAfter = typeof data.retryAfter === "number" ? data.retryAfter : null
          throw new Error(
            retryAfter
              ? `Rate limit exceeded. Try again in ${retryAfter} seconds.`
              : "Rate limit exceeded. Please try again shortly."
          )
        }
        if (response.status === 401) {
          throw new Error("Your session expired. Please refresh and sign in again.")
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
            <>
              <div className="flex items-start gap-2 mt-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
              {shouldShowSettingsLink && (
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  Open{" "}
                  <Link href="/dashboard/settings" className="text-[#FBBF24] hover:text-[#F59E0B] underline">
                    Settings
                  </Link>{" "}
                  and complete both Integrations and Billing.
                </p>
              )}
            </>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-[#9CA3AF]">What to scan</p>
            <div className="flex flex-col gap-2 text-white">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={scanConfig.analyzeTheme}
                  onChange={(event) =>
                    setScanConfig((prev) => ({ ...prev, analyzeTheme: event.target.checked }))
                  }
                />
                Theme
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={scanConfig.analyzeCheckout}
                  onChange={(event) =>
                    setScanConfig((prev) => ({ ...prev, analyzeCheckout: event.target.checked }))
                  }
                />
                Checkout
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={scanConfig.analyzeSpeed}
                  onChange={(event) =>
                    setScanConfig((prev) => ({ ...prev, analyzeSpeed: event.target.checked }))
                  }
                />
                Speed
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[#9CA3AF]">Schedule</p>
            <p className="text-white">Manual only</p>
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
