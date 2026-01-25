"use client"

import { usePathname } from "next/navigation"

const steps = [
  { label: "Connect", path: "/onboarding/connect" },
  { label: "Scanning", path: "/onboarding/scanning" },
  { label: "Results", path: "/onboarding/results" },
]

export function ProgressIndicator() {
  const pathname = usePathname()
  const currentIndex = steps.findIndex((step) => pathname?.startsWith(step.path))

  return (
    <div className="flex items-center gap-3 text-sm text-[#9CA3AF]">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center gap-3">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              index <= currentIndex ? "bg-[#FBBF24]" : "bg-[#1F1F1F]"
            }`}
          />
          <span className={index <= currentIndex ? "text-white" : undefined}>
            {step.label}
          </span>
          {index < steps.length - 1 && <div className="h-px w-8 bg-[#1F1F1F]" />}
        </div>
      ))}
    </div>
  )
}
