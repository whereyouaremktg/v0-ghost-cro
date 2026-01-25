"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

import { GhostButton } from "@/components/ui/ghost-button"

type Issue = {
  id: string
  title: string
  description: string
  category: string
  severity: "critical" | "warning" | "suggestion"
  potentialImpact: number
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export function InsightsPanel({ issues }: { issues: Issue[] }) {
  const critical = issues.filter((issue) => issue.severity === "critical")
  const warnings = issues.filter((issue) => issue.severity === "warning")
  const suggestions = issues.filter((issue) => issue.severity === "suggestion")

  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl">
      <div className="flex items-center justify-between p-5 border-b border-[#1F1F1F]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FBBF24]" />
          <h2 className="font-semibold text-white">AI Insights</h2>
        </div>
        <Link
          href="/dashboard/issues"
          className="text-sm text-[#FBBF24] hover:text-[#F59E0B]"
        >
          View all {issues.length} →
        </Link>
      </div>

      <div className="flex gap-2 p-4 border-b border-[#1F1F1F] text-xs">
        <span className="px-3 py-1 rounded-full border border-[#2A2A2A] text-white">
          All ({issues.length})
        </span>
        <span className="px-3 py-1 rounded-full border border-red-500/30 text-red-400">
          Critical ({critical.length})
        </span>
        <span className="px-3 py-1 rounded-full border border-[#FBBF24]/30 text-[#FBBF24]">
          Warnings ({warnings.length})
        </span>
        <span className="px-3 py-1 rounded-full border border-green-500/30 text-green-400">
          Suggestions ({suggestions.length})
        </span>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="divide-y divide-[#1F1F1F]"
      >
        {issues.slice(0, 5).map((issue) => (
          <motion.div
            key={issue.id}
            variants={item}
            className="p-4 hover:bg-[#161616] transition-colors"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  issue.severity === "critical"
                    ? "bg-red-500"
                    : issue.severity === "warning"
                      ? "bg-[#FBBF24]"
                      : "bg-green-500"
                }`}
              />
              <div className="flex-1">
                <p className="text-white font-medium">{issue.title}</p>
                <p className="text-sm text-[#9CA3AF] mt-1">
                  {issue.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-[#1A1A1A] text-[#9CA3AF]">
                    {issue.category}
                  </span>
                  <span className="text-green-400">
                    +{issue.potentialImpact}% potential lift
                  </span>
                </div>
              </div>
              <GhostButton variant="ghost" size="sm">
                Fix →
              </GhostButton>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
