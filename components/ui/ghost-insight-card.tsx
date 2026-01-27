"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GhostInsightCardProps {
  label?: string
  title: string
  suggestion?: string
  metric?: string
  metricType?: "positive" | "negative"
  description?: string
  severity?: "critical" | "warning" | "suggestion"
  impact?: string
  blurred?: boolean
  className?: string
  delay?: number
}

const severityStyles: Record<
  NonNullable<GhostInsightCardProps["severity"]>,
  { dot: string; text: string }
> = {
  critical: { dot: "bg-red-500", text: "text-red-400" },
  warning: { dot: "bg-[#FBBF24]", text: "text-[#FBBF24]" },
  suggestion: { dot: "bg-green-500", text: "text-green-400" },
}

export function GhostInsightCard({
  label = "Ghost Insight",
  title,
  suggestion,
  metric,
  metricType = "positive",
  description,
  severity,
  impact,
  blurred,
  className,
  delay = 0,
}: GhostInsightCardProps) {
  const severityStyle = severity ? severityStyles[severity] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn(
        "bg-[#111111]/90 backdrop-blur-sm border border-[#1F1F1F] rounded-lg p-4 shadow-xl",
        blurred && "blur-[1px] opacity-80",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            severityStyle?.dot ?? "bg-green-500",
          )}
        />
        <span className="text-xs text-gray-400">
          {severity ? `${severity} insight` : label}
        </span>
      </div>

      <div className="text-sm text-white mb-1">{title}</div>

      {description && (
        <p className="text-xs text-[#9CA3AF] mb-2">{description}</p>
      )}

      {suggestion && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">→</span>
          <span className="text-[#FBBF24]">{suggestion}</span>
        </div>
      )}

      {impact && (
        <div className={cn("text-xs", severityStyle?.text ?? "text-[#9CA3AF]")}> 
          {impact}
        </div>
      )}

      {metric && (
        <div className="mt-3 flex items-center gap-2">
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full flex items-center justify-center",
              metricType === "positive" ? "bg-green-500/20" : "bg-red-500/20",
            )}
          >
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                metricType === "positive" ? "bg-green-500" : "bg-red-500",
              )}
            />
          </div>
          <span
            className={cn(
              "text-sm",
              metricType === "positive" ? "text-green-400" : "text-red-400",
            )}
          >
            {metric}
          </span>
        </div>
      )}
    </motion.div>
  )
}
