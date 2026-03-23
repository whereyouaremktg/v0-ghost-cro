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
    <div className="flex items-center gap-3 text-sm text-[var(--ghost-text-muted)]">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center gap-3">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              index <= currentIndex ? "bg-[var(--ghost-accent-primary)]" : "bg-[var(--ghost-border)]"
            }`}
          />
          <span className={index <= currentIndex ? "text-white" : undefined}>
            {step.label}
          </span>
          {index < steps.length - 1 && <div className="h-px w-8 bg-[var(--ghost-border)]" />}
        </div>
      ))}
    </div>
  )
}
