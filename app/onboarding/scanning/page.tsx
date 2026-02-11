"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { GhostLogo } from "@/components/ghost-logo"
import { ScanChecklist } from "@/components/onboarding/scan-checklist"
import { GhostButton } from "@/components/ui/ghost-button"

const SCAN_TIMEOUT_SECONDS = 5 * 60

const steps = [
  "Connecting to your store...",
  "Reviewing theme structure...",
  "Pulling speed metrics...",
  "Evaluating mobile experience...",
  "Scanning checkout flow...",
  "Assessing trust signals...",
]

type ScanStatus = "pending" | "running" | "completed" | "failed"

const statusProgress: Record<ScanStatus, number> = {
  pending: 15,
  running: 70,
  completed: 100,
  failed: 100,
}

export default function ScanningPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-amber-400" /></div>}>
      <ScanningPageContent />
    </Suspense>
  )
}

function ScanningPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const testId = searchParams.get("testId") ?? ""
  const [status, setStatus] = useState<ScanStatus>("pending")
  const [stepIndex, setStepIndex] = useState(0)
  const [timedOut, setTimedOut] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(SCAN_TIMEOUT_SECONDS)
  const [isRestarting, setIsRestarting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    setStatus("pending")
    setStepIndex(0)
    setTimedOut(false)
    setTimeRemaining(SCAN_TIMEOUT_SECONDS)
    setActionError(null)
  }, [testId])

  useEffect(() => {
    if (!testId || timedOut) {
      return
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/analyze/${testId}/status`)
        const data = await res.json()
        setStatus(data.status)

        if (data.status === "completed") {
          window.location.href = `/onboarding/results?testId=${testId}`
        }
      } catch (error) {
        console.error("Failed to poll scan status", error)
        setStatus("failed")
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [testId, timedOut])

  useEffect(() => {
    if (!testId || timedOut || status === "completed" || status === "failed") {
      return
    }

    const interval = setInterval(() => {
      setTimeRemaining((previous) => {
        if (previous <= 1) {
          setTimedOut(true)
          return 0
        }
        return previous - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [testId, timedOut, status])

  useEffect(() => {
    if (status === "pending") {
      setStepIndex(0)
      return
    }
    if (status === "failed" || timedOut) {
      setStepIndex(steps.length - 1)
      return
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1))
    }, 1200)

    return () => clearInterval(interval)
  }, [status, timedOut])

  const handleTryAgain = async () => {
    setActionError(null)
    setIsRestarting(true)

    try {
      if (testId) {
        await fetch(`/api/analyze/${testId}/cancel`, { method: "POST" }).catch(() => null)
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await response.json()

      if (!response.ok || !data.jobId) {
        throw new Error(data.error || "Failed to restart scan")
      }

      window.location.href = `/onboarding/scanning?testId=${data.jobId}`
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to restart scan")
      setIsRestarting(false)
    }
  }

  const handleGoDashboard = () => {
    router.push("/dashboard")
  }

  const progress = statusProgress[status]
  const checklistItems = useMemo(
    () => [
      { label: "Theme structure", done: progress > 20 },
      { label: "Page speed metrics", done: progress > 40 },
      { label: "Mobile experience", done: progress > 55 },
      { label: "Checkout flow", done: progress > 75 },
      { label: "Trust signals", done: progress > 90 },
    ],
    [progress],
  )

  const countdownLabel = useMemo(() => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }, [timeRemaining])

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="relative mb-8 flex items-center justify-center">
        <GhostLogo size={80} className="animate-pulse" />
        <div className="absolute inset-0 bg-[#FBBF24]/10 rounded-full animate-ping" />
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">
        {timedOut
          ? "Analysis is taking longer than expected"
          : status === "failed"
            ? "Scan failed"
            : "Analyzing your store..."}
      </h1>

      <div className="w-full bg-[#111111] rounded-full h-2 mb-4">
        <div
          className="bg-[#FBBF24] h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!timedOut && status !== "failed" && (
        <p className="text-xs text-[#9CA3AF] mb-2">Timeout in {countdownLabel}</p>
      )}

      <p className="text-[#9CA3AF] mb-8">
        {timedOut
          ? "You can retry now or continue to dashboard while we keep things stable."
          : status === "failed"
            ? "Something went wrong while checking scan progress."
            : steps[stepIndex]}
      </p>

      <div className="text-left bg-[#111111] rounded-lg p-4 border border-[#1F1F1F]">
        <ScanChecklist items={checklistItems} />
      </div>

      {timedOut && (
        <div className="mt-6 flex flex-col gap-3">
          <GhostButton onClick={handleTryAgain} disabled={isRestarting}>
            {isRestarting ? "Restarting..." : "Try Again"}
          </GhostButton>
          <GhostButton variant="outline" onClick={handleGoDashboard} disabled={isRestarting}>
            Go to Dashboard
          </GhostButton>
          {actionError && <p className="text-sm text-red-400">{actionError}</p>}
        </div>
      )}
    </div>
  )
}
