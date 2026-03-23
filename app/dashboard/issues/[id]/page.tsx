"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  MapPin,
  Users,
  Wrench,
  Loader2,
  Rocket,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useLatestTest } from "@/hooks/use-latest-test"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/ui/code-block"
import { Skeleton } from "@/components/ui/skeleton"
import type { FrictionPoint } from "@/lib/types"

type Severity = "critical" | "high" | "medium"

export default function IssueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const issueId = params.id as string
  const { userId } = useAuthUserId()
  const { test, isLoading } = useLatestTest(userId)
  const [deploying, setDeploying] = useState(false)

  const { issue, severity } = useMemo(() => {
    if (!test) return { issue: null, severity: null }

    for (const fp of test.frictionPoints.critical) {
      if (fp.id === issueId) return { issue: fp, severity: "critical" as Severity }
    }
    for (const fp of test.frictionPoints.high) {
      if (fp.id === issueId) return { issue: fp, severity: "high" as Severity }
    }
    for (const fp of test.frictionPoints.medium) {
      if (fp.id === issueId) return { issue: fp, severity: "medium" as Severity }
    }
    return { issue: null, severity: null }
  }, [test, issueId])

  const handleDeploy = async () => {
    if (!issue?.codeFix) return
    setDeploying(true)
    try {
      const res = await fetch("/api/shopify/sandbox/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fixes: [{ frictionPointId: issue.id, codeFix: issue.codeFix }],
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Deployed to sandbox theme!")
      } else {
        toast.error(data.error || "Deployment failed")
      }
    } catch {
      toast.error("Failed to deploy")
    } finally {
      setDeploying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!issue || !severity) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-2">
          Issue not found
        </h2>
        <p className="text-sm text-[hsl(var(--text-muted))] mb-4">
          This issue may have been resolved or doesn&apos;t exist.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard/issues")}>
          Back to Issues
        </Button>
      </div>
    )
  }

  const sevConfig = {
    critical: { label: "Critical", variant: "critical" as const },
    high: { label: "High", variant: "warning" as const },
    medium: { label: "Medium", variant: "success" as const },
  }
  const config = sevConfig[severity]

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push("/dashboard/issues")}
        className="flex items-center gap-1.5 text-sm text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Issues
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={config.variant}>{config.label}</Badge>
          {issue.codeFix && (
            <Badge variant="outline">
              {issue.codeFix.effort} effort
            </Badge>
          )}
        </div>
        <h1 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-1">
          {issue.title}
        </h1>
      </div>

      {/* Details */}
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-[hsl(var(--text-dim))] mt-0.5 shrink-0" />
              <div>
                <p className="label-uppercase mb-0.5">Location</p>
                <p className="text-sm text-[hsl(var(--text-primary))]">{issue.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-[hsl(var(--text-dim))] mt-0.5 shrink-0" />
              <div>
                <p className="label-uppercase mb-0.5">Affected</p>
                <p className="text-sm text-[hsl(var(--text-primary))]">{issue.affected || "All visitors"}</p>
              </div>
            </div>
            {issue.impact && (
              <div className="flex items-start gap-2">
                <Wrench className="h-4 w-4 text-[hsl(var(--text-dim))] mt-0.5 shrink-0" />
                <div>
                  <p className="label-uppercase mb-0.5">Impact</p>
                  <p className="text-sm text-[hsl(var(--text-primary))]">{issue.impact}</p>
                </div>
              </div>
            )}
          </div>

          {issue.fix && (
            <div className="pt-4 border-t border-[hsl(var(--border-default))]">
              <p className="label-uppercase mb-2">Recommendation</p>
              <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">{issue.fix}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Code Fix */}
      {issue.codeFix && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Code Fix</CardTitle>
            <Button
              size="sm"
              onClick={handleDeploy}
              disabled={deploying}
            >
              {deploying ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="h-3.5 w-3.5" />
                  Deploy to Sandbox
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {issue.codeFix.reasoningTrace && (
              <div>
                <p className="label-uppercase mb-1.5">AI Reasoning</p>
                <p className="text-sm text-[hsl(var(--text-muted))] leading-relaxed">
                  {issue.codeFix.reasoningTrace}
                </p>
              </div>
            )}

            <CodeBlock
              code={issue.codeFix.optimizedCode}
              language={issue.codeFix.type}
              filename={issue.codeFix.targetFile}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
