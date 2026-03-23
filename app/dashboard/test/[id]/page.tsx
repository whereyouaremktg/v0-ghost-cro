"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useTestResult } from "@/hooks/use-test-result"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScoreRing } from "@/components/ui/score-ring"
import { Skeleton } from "@/components/ui/skeleton"

export default function TestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.id as string
  const { test, isLoading } = useTestResult(testId)

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!test) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-2">
          Test not found
        </h2>
        <Button variant="outline" onClick={() => router.push("/dashboard/history")}>
          Back to History
        </Button>
      </div>
    )
  }

  const criticalCount = test.frictionPoints.critical.length
  const highCount = test.frictionPoints.high.length
  const mediumCount = test.frictionPoints.medium.length

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push("/dashboard/history")}
        className="flex items-center gap-1.5 text-sm text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to History
      </button>

      {/* Header */}
      <div className="flex items-center gap-6">
        <ScoreRing score={test.score} size={100} />
        <div>
          <h1 className="text-xl font-bold text-[hsl(var(--text-primary))]">
            Scan Results
          </h1>
          <p className="text-sm text-[hsl(var(--text-muted))]">
            {test.url} &middot; {test.personaMix} mix
          </p>
          <div className="flex gap-2 mt-2">
            {criticalCount > 0 && <Badge variant="critical">{criticalCount} critical</Badge>}
            {highCount > 0 && <Badge variant="warning">{highCount} high</Badge>}
            {mediumCount > 0 && <Badge variant="success">{mediumCount} medium</Badge>}
          </div>
        </div>
      </div>

      {/* Personas */}
      {test.personaResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Persona Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {test.personaResults.map((persona) => (
              <div key={persona.id} className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--surface-2))]">
                <Badge variant={persona.verdict === "purchase" ? "success" : "critical"}>
                  {persona.verdict}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{persona.name}</p>
                  <p className="text-xs text-[hsl(var(--text-dim))] truncate">{persona.reasoning}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Issues ({criticalCount + highCount + mediumCount})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            ...test.frictionPoints.critical.map((fp) => ({ ...fp, sev: "critical" as const })),
            ...test.frictionPoints.high.map((fp) => ({ ...fp, sev: "high" as const })),
            ...test.frictionPoints.medium.map((fp) => ({ ...fp, sev: "medium" as const })),
          ].map((issue) => (
            <div
              key={issue.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--surface-2))] transition-colors cursor-pointer"
              onClick={() => router.push(`/dashboard/issues/${issue.id}`)}
            >
              <div
                className={`w-1.5 h-8 rounded-full shrink-0 ${
                  issue.sev === "critical"
                    ? "bg-[hsl(var(--critical))]"
                    : issue.sev === "high"
                      ? "bg-[hsl(var(--warning))]"
                      : "bg-[hsl(var(--success))]"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[hsl(var(--text-primary))] truncate">{issue.title}</p>
                <p className="text-xs text-[hsl(var(--text-dim))]">{issue.location}</p>
              </div>
              {issue.codeFix && (
                <Badge variant="outline" className="text-[10px] shrink-0">Fix</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
