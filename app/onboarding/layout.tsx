"use client"

import type React from "react"

import { ProgressIndicator } from "@/components/onboarding/progress-indicator"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="px-6 pt-8">
        <ProgressIndicator />
      </div>
      <div className="px-6 py-12">{children}</div>
    </div>
  )
}
