"use client"

import { useEffect, useState } from "react"

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

export default function ScanningPage() {
  const [progress, setProgress] = useState(12)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 96))
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1))
    }, 1400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="relative mb-8 flex items-center justify-center">
        <GhostLogo size={80} className="animate-pulse" />
        <div className="absolute inset-0 bg-[#FBBF24]/10 rounded-full animate-ping" />
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">
        Analyzing Northwind Co...
      </h1>

      <div className="w-full bg-[#111111] rounded-full h-2 mb-4">
        <div
          className="bg-[#FBBF24] h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-[#9CA3AF] mb-8">{steps[stepIndex]}</p>

      <div className="text-left bg-[#111111] rounded-lg p-4 border border-[#1F1F1F]">
        <ScanChecklist
          items={[
            { label: "Theme structure", done: progress > 20 },
            { label: "Page speed metrics", done: progress > 40 },
            { label: "Mobile experience", done: progress > 60 },
            { label: "Checkout flow", done: progress > 80 },
            { label: "Trust signals", done: progress > 90 },
          ]}
        />
      </div>
    </div>
  )
}
