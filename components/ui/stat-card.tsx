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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-[#1F1F1F] bg-[#111111] p-5 hover:border-[#2A2A2A] transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-[#9CA3AF]">{label}</span>
        <div className="rounded-lg bg-[#0A0A0A] p-2">
          <Icon className="h-4 w-4 text-[#FBBF24]" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {trend !== undefined && trendLabel && (
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "text-sm",
              trendPositive ? "text-green-400" : "text-red-400",
            )}
          >
            {trendPositive ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
          <span className="text-sm text-[#6B7280]">{trendLabel}</span>
        </div>
      )}
      {subtitle && <p className="text-sm text-[#6B7280]">{subtitle}</p>}
    </motion.div>
  )
}
