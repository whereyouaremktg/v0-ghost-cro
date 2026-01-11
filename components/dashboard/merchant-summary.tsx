"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp,
  ArrowRight,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  DollarSign,
  ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TestResult } from "@/lib/types"
import { calculateRevenueOpportunity, formatOpportunityRange } from "@/lib/calculations/revenue-opportunity"
import { formatCurrency } from "@/lib/utils/format"

interface MerchantSummaryProps {
  result: TestResult
  onViewFix?: (fix: any) => void
}

export function MerchantSummary({ result, onViewFix }: MerchantSummaryProps) {
  // 1. Calculate Revenue Leak (The "Hook")
  const revenueOpportunity = calculateRevenueOpportunity({
    monthlyVisitors: 50000, // TODO: Pull from Store Leads/GA4
    currentConversionRate: 0.025,
    aov: 85,
    categoryBenchmarkCR: 0.028,
  })

  // 2. Identify Top 3 Quick Wins (The "Action")
  const topFixes = result.recommendations
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)

  // Helper for industry benchmarking
  const getIndustryBenchmark = (score: number) => {
    if (score >= 80) return "Top 10%"
    if (score >= 60) return "Top 25%"
    if (score >= 40) return "Average"
    if (score >= 20) return "Bottom 25%"
    return "Bottom 10%"
  }

  return (
    <div className="h-full overflow-y-auto bg-[#020202] text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* HERO: The Revenue Leak */}
        <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 md:p-12">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium tracking-wide uppercase">
                  <ShieldAlert className="w-3 h-3" />
                  Revenue At Risk
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-2">
                <span className="text-white">You're leaving </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 font-variant-numeric tabular-nums">
                  {formatCurrency(revenueOpportunity.monthlyOpportunity.max)}
                </span>
                <span className="text-white"> on the table.</span>
              </h1>

              <p className="text-lg text-zinc-400 mt-4 leading-relaxed max-w-md">
                Based on your traffic of 50k/mo, fixing these friction points could capture this lost revenue every single month.
              </p>
            </div>

            {/* Score Card */}
            <div className="flex flex-col gap-6">
              <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider mb-1">Ghost Score</div>
                    <div className="text-5xl font-bold font-variant-numeric tabular-nums tracking-tighter text-white">
                      {result.score}<span className="text-zinc-600 text-2xl">/100</span>
                    </div>
                  </div>
                  {/* Mini Chart Visualization */}
                  <div className="h-12 w-12 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="22" cy="22" r="18"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-white/5"
                      />
                      <circle
                        cx="22" cy="22" r="18"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={113}
                        strokeDashoffset={113 - (113 * result.score) / 100}
                        className={cn("transition-all duration-1000 ease-out",
                          result.score > 70 ? "text-emerald-500" :
                          result.score > 50 ? "text-amber-500" : "text-red-500"
                        )}
                      />
                    </svg>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Benchmarking</span>
                    <span className="text-white font-medium">{getIndustryBenchmark(result.score)} of Shopify stores</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.score}%` }}
                      className={cn("h-full rounded-full",
                        result.score > 70 ? "bg-emerald-500" :
                        result.score > 50 ? "bg-amber-500" : "bg-red-500"
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRIORITY ACTIONS: Linear Style List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" fill="currentColor" />
                Priority Recovery Queue
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                Top 3 actions to recover the most revenue with the least effort.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {topFixes.map((fix, index) => (
              <motion.div
                key={fix.priority}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-xl border border-white/5 bg-[#0A0A0A] hover:bg-white/[0.03] transition-all duration-300"
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center gap-6">
                  {/* Priority Indicator */}
                  <div className="flex-shrink-0 flex items-center gap-4 min-w-[140px]">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[#0070F3] flex items-center justify-center font-mono font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Est. Recovery</span>
                      <span className="text-sm font-medium text-emerald-400">
                        +${Math.round(revenueOpportunity.monthlyOpportunity.min * 0.15).toLocaleString()}/mo
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-white mb-1 group-hover:text-blue-400 transition-colors">
                      {fix.title}
                    </h3>
                    <p className="text-sm text-zinc-400 line-clamp-1">
                      {fix.description}
                    </p>
                  </div>

                  {/* Metadata & Action */}
                  <div className="flex items-center gap-6 flex-shrink-0 mt-4 md:mt-0 justify-between md:justify-end w-full md:w-auto">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                      <Clock className="w-3.5 h-3.5" />
                      {fix.timeEstimate || (fix.effort === 'low' ? '5-15 min' : fix.effort === 'medium' ? '30-60 min' : '2+ hours')}
                    </div>

                    <Button
                      onClick={() => onViewFix?.(fix)}
                      className="bg-white text-black hover:bg-zinc-200 font-medium rounded-lg px-5 h-9 text-xs transition-all active:scale-95"
                    >
                      Fix This Now
                      <ArrowRight className="w-3.5 h-3.5 ml-2 opacity-60" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
             <Button variant="ghost" className="text-zinc-500 hover:text-white text-sm">
                View All {result.recommendations.length} Recommendations
             </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
