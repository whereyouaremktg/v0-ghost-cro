"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Loader2 } from "lucide-react"

import { ResultsPreview } from "@/components/onboarding/results-preview"
import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"
import { ScoreGauge } from "@/components/ui/score-gauge"
import { Skeleton } from "@/components/ui/skeleton"
import { useTestResult } from "@/hooks/use-test-result"
import type { FrictionPoint } from "@/lib/types"

type PreviewIssue = {
  title: string
  description: string
  severity: "critical" | "warning" | "suggestion"
  impact: string
}

const toPreviewIssue = (
  issue: FrictionPoint,
  severity: PreviewIssue["severity"],
): PreviewIssue => ({
  title: issue.title,
  description: issue.fix || issue.impact || "",
  severity,
  impact: issue.impact || "",
})

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-amber-400" /></div>}>
      <ResultsPageContent />
    </Suspense>
  )
}

function ResultsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const testId = searchParams.get("testId")
  const { test, isLoading } = useTestResult(testId)
  const [isStartingTrial, setIsStartingTrial] = useState(false)

  const handleStartTrial = async () => {
    setIsStartingTrial(true)
    try {
      const response = await fetch('/api/shopify/billing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' })
      })
      const data = await response.json()
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl
      } else {
        // If no billing URL, just go to dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to start trial', error)
      // On error, still navigate to dashboard
      router.push('/dashboard')
    }
  }

  const handleContinueFree = () => {
    router.push('/dashboard')
  }

  const topIssues = useMemo(() => {
    if (!test) {
      return []
    }

    const combined = [
      ...test.frictionPoints.critical.map((issue) =>
        toPreviewIssue(issue, "critical"),
      ),
      ...test.frictionPoints.high.map((issue) =>
        toPreviewIssue(issue, "warning"),
      ),
      ...test.frictionPoints.medium.map((issue) =>
        toPreviewIssue(issue, "suggestion"),
      ),
    ]

    return combined.slice(0, 3)
  }, [test])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!test) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 text-center">
        <h1 className="text-2xl font-bold text-white">Results pending</h1>
        <p className="text-[var(--ghost-text-muted)]">
          We couldn't load your results yet. Please refresh or rerun the scan.
        </p>
      </div>
    )
  }

  const score = test.score
  const issueCount = test.issuesFound
  const potentialRevenue = (test as { revenueLeak?: number }).revenueLeak ?? 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full mb-4">
          <CheckCircle className="w-4 h-4" />
          Analysis Complete
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          We found ${potentialRevenue.toLocaleString()} in hidden revenue
        </h1>

        <p className="text-[var(--ghost-text-muted)]">
          Ghost identified {issueCount} optimization opportunities for your
          store.
        </p>
      </div>

      <GhostCard className="p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[var(--ghost-text-muted)] mb-2">Your Store Health Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold text-white">{score}</span>
              <span className="text-2xl text-[var(--ghost-text-subtle)]">/100</span>
            </div>
            <p className="text-[var(--ghost-accent-primary)] mt-2">Good, with room to grow</p>
          </div>
          <ScoreGauge score={score} size={160} />
        </div>
      </GhostCard>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Top Opportunities
        </h2>
        <ResultsPreview issues={topIssues} />
        <div className="mt-4 text-center text-[var(--ghost-text-subtle)]">
          + {Math.max(issueCount - 3, 0)} more opportunities
        </div>
      </div>

      <div className="bg-gradient-to-r from-[var(--ghost-accent-primary)]/10 to-transparent border border-[var(--ghost-accent-primary)]/20 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">
              Unlock all {issueCount} opportunities
            </h3>
            <p className="text-[var(--ghost-text-muted)]">
              Get detailed fixes, code snippets, and ongoing monitoring
            </p>
          </div>
          <GhostButton
            className="px-6"
            onClick={handleStartTrial}
            disabled={isStartingTrial}
          >
            {isStartingTrial ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Start Free Trial →'
            )}
          </GhostButton>
        </div>
      </div>

      <div className="text-center mt-4">
        <button
          className="text-[var(--ghost-text-subtle)] hover:text-[var(--ghost-text-muted)] text-sm"
          onClick={handleContinueFree}
        >
          Continue with limited access →
        </button>
      </div>
    </div>
  )
}
