"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Lightbulb, UserCircle, ThumbsUp, ThumbsDown, Target } from "lucide-react"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useLatestTest } from "@/hooks/use-latest-test"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"

export default function InsightsPage() {
  const { userId } = useAuthUserId()
  const { test, isLoading } = useLatestTest(userId)
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="No insights yet"
        description="Run a scan to get AI-powered persona insights and recommendations."
        action={{
          label: "Run Scan",
          onClick: () => router.push("/dashboard/scanner"),
        }}
      />
    )
  }

  const purchaseCount = test.personaResults.filter((p) => p.verdict === "purchase").length
  const abandonCount = test.personaResults.filter((p) => p.verdict === "abandon").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Ghost Personas</h2>
        <p className="text-sm text-[hsl(var(--text-muted))]">
          AI buyer personas simulated against your store. {purchaseCount} would purchase, {abandonCount} would abandon.
        </p>
      </div>

      {/* Persona Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {test.personaResults.map((persona) => (
          <Card key={persona.id} className="overflow-hidden">
            <div
              className={`h-1 ${
                persona.verdict === "purchase"
                  ? "bg-[hsl(var(--success))]"
                  : "bg-[hsl(var(--critical))]"
              }`}
            />
            <CardContent className="pt-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--surface-2))] flex items-center justify-center shrink-0">
                  <UserCircle className="h-5 w-5 text-[hsl(var(--text-dim))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))]">
                    {persona.name}
                  </p>
                  <p className="text-xs text-[hsl(var(--text-dim))]">{persona.demographics}</p>
                </div>
                <Badge
                  variant={persona.verdict === "purchase" ? "success" : "critical"}
                >
                  {persona.verdict === "purchase" ? (
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" /> Purchase
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="h-3 w-3" /> Abandon
                    </span>
                  )}
                </Badge>
              </div>

              <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed mb-3">
                {persona.reasoning}
              </p>

              {persona.abandonPoint && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[hsl(var(--critical-soft))]">
                  <Target className="h-3.5 w-3.5 text-[hsl(var(--critical))] mt-0.5 shrink-0" />
                  <p className="text-xs text-[hsl(var(--critical))]">
                    Abandon point: {persona.abandonPoint}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      {test.recommendations.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] mb-3">
            Recommendations
          </h3>
          <div className="space-y-2">
            {test.recommendations.map((rec, i) => (
              <Card key={i}>
                <CardContent className="py-4 px-4 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[hsl(var(--accent)/0.1)] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[hsl(var(--accent))]">{rec.priority}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{rec.title}</p>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {rec.effort}
                      </Badge>
                    </div>
                    <p className="text-xs text-[hsl(var(--text-muted))] leading-relaxed">
                      {rec.description}
                    </p>
                    {rec.impact && (
                      <p className="text-xs text-[hsl(var(--accent))] mt-1">{rec.impact}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
