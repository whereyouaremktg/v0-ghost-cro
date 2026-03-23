"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Ghost, CheckCircle, Circle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"

const SCAN_STEPS = [
  { label: "Analyzing theme structure", threshold: 15 },
  { label: "Evaluating page speed", threshold: 35 },
  { label: "Checking mobile experience", threshold: 55 },
  { label: "Simulating buyer personas", threshold: 75 },
  { label: "Generating recommendations", threshold: 90 },
]

export default function ScanningPage() {
  return (
    <Suspense fallback={<ScanningFallback />}>
      <ScanningContent />
    </Suspense>
  )
}

function ScanningFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--accent))]" />
    </div>
  )
}

function ScanningContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const testId = searchParams.get("testId")
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"running" | "completed" | "failed">("running")

  useEffect(() => {
    if (!testId) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/analyze/${testId}/status`)
        if (!res.ok) return

        const data = await res.json()

        if (data.status === "completed") {
          setProgress(100)
          setStatus("completed")
          clearInterval(interval)
          // Brief delay so user sees 100%, then navigate
          setTimeout(() => {
            router.push(`/onboarding/results?testId=${testId}`)
          }, 1000)
        } else if (data.status === "failed") {
          setStatus("failed")
          clearInterval(interval)
        } else {
          // Simulate incremental progress
          setProgress((prev) => Math.min(prev + 3, 92))
        }
      } catch {
        // Network error, keep polling
      }
    }, 3000)

    // Initial progress tick
    const progressTick = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev
        return prev + 1
      })
    }, 2000)

    return () => {
      clearInterval(interval)
      clearInterval(progressTick)
    }
  }, [testId, router])

  return (
    <div className="text-center">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <StepDot completed label="1" />
        <StepLine active />
        <StepDot active label="2" />
        <StepLine />
        <StepDot label="3" />
      </div>

      {/* Ghost animation */}
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[hsl(var(--accent)/0.1)] ghost-pulse">
          <Ghost className="h-10 w-10 text-[hsl(var(--accent))]" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">
        {status === "failed" ? "Scan failed" : "Scanning your store..."}
      </h1>
      <p className="text-[hsl(var(--text-muted))] mb-8">
        {status === "failed"
          ? "Something went wrong during the analysis."
          : "Ghost is analyzing your theme with AI buyer personas. This takes 1-3 minutes."}
      </p>

      {status !== "failed" && (
        <div className="max-w-sm mx-auto mb-8">
          <Progress value={progress} className="h-2 mb-2" />
          <p className="text-xs text-[hsl(var(--text-dim))] text-right">{progress}%</p>
        </div>
      )}

      {/* Checklist */}
      <Card className="max-w-sm mx-auto">
        <CardContent className="pt-6">
          <div className="space-y-3 text-left">
            {SCAN_STEPS.map((step) => {
              const isDone = progress >= step.threshold
              const isActive = !isDone && progress >= step.threshold - 20

              return (
                <div key={step.label} className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle className="h-4 w-4 text-[hsl(var(--success))] shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 text-[hsl(var(--accent))] animate-spin shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-[hsl(var(--text-dim))] shrink-0" />
                  )}
                  <span
                    className={`text-sm ${
                      isDone
                        ? "text-[hsl(var(--text-primary))]"
                        : isActive
                          ? "text-[hsl(var(--text-secondary))]"
                          : "text-[hsl(var(--text-dim))]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {status === "failed" && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      )}
    </div>
  )
}

function StepDot({ active, completed, label }: { active?: boolean; completed?: boolean; label: string }) {
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
        completed
          ? "bg-[hsl(var(--success))] text-white"
          : active
            ? "bg-[hsl(var(--accent))] text-[hsl(var(--primary-foreground))]"
            : "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-muted))]"
      }`}
    >
      {completed ? <CheckCircle className="h-4 w-4" /> : label}
    </div>
  )
}

function StepLine({ active }: { active?: boolean }) {
  return (
    <div
      className={`w-12 h-px ${
        active ? "bg-[hsl(var(--accent))]" : "bg-[hsl(var(--border-default))]"
      }`}
    />
  )
}
