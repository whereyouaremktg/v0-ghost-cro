"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { CheckCircle2, Copy, ExternalLink, Loader2 } from "lucide-react"

import { EmptyState } from "@/components/ui/empty-state"
import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useLatestTest } from "@/hooks/use-latest-test"

export default function IssueDetailPage() {
  const params = useParams()
  const issueId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const { userId, isLoading: isUserLoading } = useAuthUserId()
  const { test, isLoading } = useLatestTest(userId)
  const [isCopied, setIsCopied] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployError, setDeployError] = useState<string | null>(null)

  const issue = useMemo(() => {
    if (!test || !issueId) {
      return null
    }
    const allIssues = [
      ...test.frictionPoints.critical,
      ...test.frictionPoints.high,
      ...test.frictionPoints.medium,
    ]
    return allIssues.find((item) => item.id === issueId) ?? null
  }, [issueId, test])

  const handleCopy = async () => {
    if (!issue?.codeFix?.optimizedCode) {
      return
    }
    try {
      await navigator.clipboard.writeText(issue.codeFix.optimizedCode)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy code", error)
    }
  }

  const handleMarkFixed = async () => {
    if (!issue || !test?.id) {
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/issues/${issue.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_id: test.id, status: "fixed" }),
      })

      if (!response.ok) {
        console.error("Failed to update issue status")
      }
    } catch (error) {
      console.error("Failed to update issue status", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const canPreviewFix =
    issue?.codeFix &&
    issue.codeFix.optimizedCode &&
    issue.codeFix.targetFile &&
    issue.codeFix.type

  const handlePreviewFix = async () => {
    if (!issue?.codeFix || !canPreviewFix) return

    setIsDeploying(true)
    setDeployError(null)
    try {
      const response = await fetch("/api/shopify/sandbox/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fixes: [
            {
              frictionPointId: issue.id,
              codeFix: issue.codeFix,
            },
          ],
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        setDeployError(data.error ?? "Failed to deploy to sandbox")
        return
      }
      if (data.success && data.previewUrl) {
        window.open(data.previewUrl, "_blank")
      } else {
        setDeployError("No preview URL returned")
      }
    } catch (error) {
      setDeployError(error instanceof Error ? error.message : "Failed to deploy to sandbox")
    } finally {
      setIsDeploying(false)
    }
  }

  if (isUserLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  if (!issue) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="Issue not found"
        description="We couldn't locate this issue in your latest scan."
        action={
          <GhostButton asChild variant="secondary">
            <a href="/dashboard/issues">Back to issues</a>
          </GhostButton>
        }
      />
    )
  }

  const codeSnippet = issue.codeFix?.optimizedCode ?? "// No code snippet provided."
  const description = issue.fix || issue.impact

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-[#6B7280]">Issue ID: {issue.id}</p>
        <h2 className="text-2xl font-semibold text-white mt-2">
          {issue.title}
        </h2>
        {description && (
          <p className="text-[#9CA3AF] mt-2 max-w-2xl">{description}</p>
        )}
      </div>

      <GhostCard className="p-6 space-y-3">
        <h3 className="text-lg font-semibold text-white">Fix summary</h3>
        <p className="text-[#9CA3AF]">{issue.fix}</p>
        {issue.location && (
          <p className="text-xs text-[#6B7280]">Location: {issue.location}</p>
        )}
      </GhostCard>

      <GhostCard className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Step-by-step fix</h3>
        <ol className="list-decimal list-inside text-[#9CA3AF] space-y-2">
          <li>Open your Shopify theme editor for the affected page.</li>
          <li>Locate {issue.location || "the relevant section"}.</li>
          <li>Apply the optimized snippet below.</li>
          <li>Publish and rerun a scan to confirm the lift.</li>
        </ol>
      </GhostCard>

      <GhostCard className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-white">Code snippet</h3>
          <div className="flex items-center gap-2">
            <GhostButton variant="secondary" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
              {isCopied ? "Copied" : "Copy"}
            </GhostButton>
            <GhostButton
              variant="secondary"
              size="sm"
              onClick={handlePreviewFix}
              disabled={!canPreviewFix || isDeploying}
              title={!canPreviewFix ? "No code fix available for this issue" : "Deploy to sandbox and open preview in a new tab"}
            >
              {isDeploying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              {isDeploying ? "Deploying..." : "Preview Fix"}
            </GhostButton>
          </div>
        </div>
        {deployError && (
          <p className="text-sm text-red-400">{deployError}</p>
        )}
        <pre className="rounded-lg bg-[#0A0A0A] border border-[#1F1F1F] p-4 text-sm text-[#9CA3AF] overflow-auto whitespace-pre-wrap">
          {codeSnippet}
        </pre>
        {canPreviewFix && (
          <p className="text-xs text-[#6B7280]">Preview Fix opens the sandbox theme in a new tab.</p>
        )}
      </GhostCard>

      <GhostCard className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            Mark as fixed when ready
          </div>
          <GhostButton onClick={handleMarkFixed} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Mark as Fixed"}
          </GhostButton>
        </div>
      </GhostCard>
    </div>
  )
}
