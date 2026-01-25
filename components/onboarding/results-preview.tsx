import { GhostInsightCard } from "@/components/ui/ghost-insight-card"

type ResultIssue = {
  title: string
  description: string
  severity: "critical" | "warning" | "suggestion"
  impact: string
}

type ResultsPreviewProps = {
  issues: ResultIssue[]
}

export function ResultsPreview({ issues }: ResultsPreviewProps) {
  return (
    <div className="space-y-3">
      {issues.map((issue) => (
        <GhostInsightCard
          key={issue.title}
          title={issue.title}
          description={issue.description}
          severity={issue.severity}
          impact={issue.impact}
          blurred
        />
      ))}
    </div>
  )
}
