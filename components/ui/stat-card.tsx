"use client"

import { motion } from "framer-motion"
import { type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type StatCardProps = {
  label: string
  value: string
  trend?: number
  trendLabel?: string
  trendPositive?: boolean
  subtitle?: string
  icon: LucideIcon
  index?: number
}

export function StatCard({
  label,
  value,
  trend,
  trendLabel,
  trendPositive = true,
  subtitle,
  icon: Icon,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-[#1F1F1F] bg-[#111111] p-5 card-shine hover:border-[#2A2A2A] transition-colors duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="label-uppercase">{label}</span>
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-2">
          <Icon className="h-4 w-4 text-[#FBBF24]" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white text-mono-data mb-1">{value}</div>
      {trend !== undefined && trendLabel && (
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium text-mono-data",
              trendPositive
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400",
            )}
          >
            {trendPositive ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
          <span className="text-xs text-[#6B7280]">{trendLabel}</span>
        </div>
      )}
      {subtitle && <p className="text-xs text-[#6B7280]">{subtitle}</p>}
    </motion.div>
  )
}
