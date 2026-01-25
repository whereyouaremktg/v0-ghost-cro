import { cn } from "@/lib/utils"

type GhostInsightCardProps = {
  title: string
  description: string
  severity?: "critical" | "warning" | "suggestion"
  impact?: string
  blurred?: boolean
}

const severityStyles = {
  critical: "border-[#EF4444]/40 bg-[#EF4444]/10 text-[#FCA5A5]",
  warning: "border-[#FBBF24]/40 bg-[#FBBF24]/10 text-[#FBBF24]",
  suggestion: "border-[#10B981]/40 bg-[#10B981]/10 text-[#34D399]",
}

export function GhostInsightCard({
  title,
  description,
  severity = "warning",
  impact,
  blurred,
}: GhostInsightCardProps) {
  return (
    <div className="rounded-xl border border-[#1F1F1F] bg-[#111111] p-4">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-full border",
            severityStyles[severity],
          )}
        >
          {severity}
        </span>
        {impact && <span className="text-xs text-[#9CA3AF]">{impact}</span>}
      </div>
      <div className={cn("mt-3 space-y-2", blurred && "blur-sm select-none")}>
        <h3 className="text-white font-semibold">{title}</h3>
        <p className="text-sm text-[#9CA3AF]">{description}</p>
      </div>
      {blurred && (
        <p className="mt-3 text-xs text-[#6B7280]">
          Upgrade to unlock the full recommendation.
        </p>
      )}
    </div>
  )
}
