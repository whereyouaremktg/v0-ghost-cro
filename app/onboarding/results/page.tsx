"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Loader2, ArrowRight } from "lucide-react"
import { useTestResult } from "@/hooks/use-test-result"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScoreRing } from "@/components/ui/score-ring"
import { Skeleton } from "@/components/ui/skeleton"
import type { FrictionPoint } from "@/lib/types"

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--accent))]" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  )
}

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const testId = searchParams.get("testId")
  const { test, isLoading } = useTestResult(testId)
  const [isStartingTrial, setIsStartingTrial] = useState(false)

  const handleStartTrial = async () => {
    setIsStartingTrial(true)
    try {
      const response = await fetch("/api/shopify/billing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "growth" }),
      })
      const data = await response.json()
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl
      } else {
        router.push("/dashboard")
      }
    } catch {
      router.push("/dashboard")
    }
  }

  const topIssues = useMemo(() => {
    if (!test) return []
    const all = [
      ...test.frictionPoints.critical.map((fp) => ({ ...fp, severity: "critical" as const })),
      ...test.frictionPoints.high.map((fp) => ({ ...fp, severity: "warning" as const })),
      ...test.frictionPoints.medium.map((fp) => ({ ...fp, severity: "success" as const })),
    ]
    return all.slice(0, 3)
  }, [test])

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (!test) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-2">Results pending</h1>
        <p className="text-[hsl(var(--text-muted))] mb-6">
          We couldn&apos;t load your results yet. Please try again.
        </p>
        <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
      </div>
    )
  }

  const score = test.score
  const issueCount = test.issuesFound

  return (
    <div className="text-center">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <StepDot completed label="1" />
        <StepLine completed />
        <StepDot completed label="2" />
        <StepLine completed />
        <StepDot active label="3" />
      </div>

      <div className="inline-flex items-center gap-2 bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] px-4 py-2 rounded-full mb-6">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Analysis Complete</span>
      </div>

      <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">
        We found {issueCount} optimization opportunities
      </h1>
      <p className="text-[hsl(var(--text-muted))] mb-8">
        Here&apos;s a preview of your store health report.
      </p>

      {/* Score card */}
      <Card className="max-w-md mx-auto mb-8">
        <CardContent className="pt-8 pb-8 flex flex-col items-center">
          <ScoreRing score={score} size={140} />
          <p className="text-sm text-[hsl(var(--text-muted))] mt-4">Store Health Score</p>
        </CardContent>
      </Card>

      {/* Top issues */}
      {topIssues.length > 0 && (
        <div className="max-w-md mx-auto mb-8">
          <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-3 text-left">
            Top Opportunities
          </h2>
          <div className="space-y-2">
            {topIssues.map((issue, i) => (
              <Card key={i} className="text-left">
                <CardContent className="py-3 px-4 flex items-center gap-3">
                  <Badge
                    variant={
                      issue.severity === "critical"
                        ? "critical"
                        : issue.severity === "warning"
                          ? "warning"
                          : "success"
                    }
                  >
                    {issue.severity === "critical" ? "Critical" : issue.severity === "warning" ? "High" : "Medium"}
                  </Badge>
                  <span className="text-sm text-[hsl(var(--text-primary))] flex-1 truncate">
                    {issue.title}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
          {issueCount > 3 && (
            <p className="text-xs text-[hsl(var(--text-dim))] mt-2">
              + {issueCount - 3} more opportunities
            </p>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="max-w-md mx-auto">
        <Card className="border-[hsl(var(--accent)/0.2)] bg-[hsl(var(--accent)/0.05)]">
          <CardContent className="py-6">
            <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-1">
              Unlock all {issueCount} fixes
            </h3>
            <p className="text-sm text-[hsl(var(--text-muted))] mb-4">
              Get detailed code fixes, deployment tools, and ongoing monitoring.
            </p>
            <Button onClick={handleStartTrial} disabled={isStartingTrial} className="w-full">
              {isStartingTrial ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <button
          className="mt-4 text-sm text-[hsl(var(--text-dim))] hover:text-[hsl(var(--text-muted))] transition-colors"
          onClick={() => router.push("/dashboard")}
        >
          Continue with limited access
        </button>
      </div>
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

function StepLine({ completed }: { completed?: boolean }) {
  return (
    <div
      className={`w-12 h-px ${
        completed ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--border-default))]"
      }`}
    />
  )
}
