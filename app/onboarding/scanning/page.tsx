"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

import { GhostLogo } from "@/components/ghost-logo"
import { ScanChecklist } from "@/components/onboarding/scan-checklist"

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
  const searchParams = useSearchParams()
  const testId = searchParams.get("testId") ?? ""
  const [status, setStatus] = useState<ScanStatus>("pending")
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (!testId) {
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
  }, [testId])

  useEffect(() => {
    if (status === "pending") {
      setStepIndex(0)
      return
    }
    if (status === "failed") {
      setStepIndex(steps.length - 1)
      return
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1))
    }, 1200)

    return () => clearInterval(interval)
  }, [status])

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

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="relative mb-8 flex items-center justify-center">
        <GhostLogo size={80} className="animate-pulse" />
        <div className="absolute inset-0 bg-[#FBBF24]/10 rounded-full animate-ping" />
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">
        {status === "failed" ? "Scan failed" : "Analyzing your store..."}
      </h1>

      <div className="w-full bg-[#111111] rounded-full h-2 mb-4">
        <div
          className="bg-[#FBBF24] h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-[#9CA3AF] mb-8">
        {status === "failed" ? "Something went wrong. Retrying..." : steps[stepIndex]}
      </p>

      <div className="text-left bg-[#111111] rounded-lg p-4 border border-[#1F1F1F]">
        <ScanChecklist items={checklistItems} />
      </div>
    </div>
  )
}
