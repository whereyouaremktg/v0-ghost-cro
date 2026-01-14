"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, ArrowRight, Clock, Zap, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TestResult } from "@/lib/types"

// Helper function for revenue calculation
const calculateRevenueOpportunity = (visitors: number = 50000, cr: number = 0.025, aov: number = 85) => {
  const improvement = 0.15 // 15% lift
  const monthly = visitors * cr * aov
  return { min: monthly * improvement, max: monthly * improvement * 1.5 }
}

export function MerchantSummary({ result, onViewFix }: { result: TestResult, onViewFix?: (fix: any) => void }) {
  const opportunity = calculateRevenueOpportunity()
  const topFixes = result.recommendations.slice(0, 3)

  return (
    <div className="h-full overflow-y-auto bg-[#020202] text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 md:p-12">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="flex items-center gap-1.5 w-fit px-3 py-1 mb-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium uppercase">
                <ShieldAlert className="w-3 h-3" /> Revenue At Risk
              </span>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-2">
                <span className="text-white">You're leaving </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                  ${Math.round(opportunity.min).toLocaleString()}
                </span>
                <span className="text-white"> on the table.</span>
              </h1>
              <p className="text-lg text-zinc-400 mt-4 leading-relaxed max-w-md">
                Based on your traffic, fixing these friction points could capture this lost revenue every month.
              </p>
            </div>
            {/* SCORE */}
            <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 shadow-2xl">
              <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider mb-1">Ghost Score</div>
              <div className="text-5xl font-bold text-white mb-2">{result.score}/100</div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${result.score}%` }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* PRIORITY QUEUE */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-yellow-400" fill="currentColor" />
            <h2 className="text-xl font-semibold text-white">Priority Recovery Queue</h2>
          </div>
          <div className="grid gap-4">
            {topFixes.map((fix, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl border border-white/5 bg-[#0A0A0A] hover:bg-white/[0.03] transition-all p-5 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4 min-w-[140px]">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-[#0070F3] flex items-center justify-center font-bold text-sm">{index + 1}</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-zinc-500 font-semibold">Recovery</span>
                    <span className="text-sm font-medium text-emerald-400">High Impact</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-medium text-white mb-1">{fix.title}</h3>
                  <p className="text-sm text-zinc-400 line-clamp-1">{fix.description}</p>
                </div>
                <Button onClick={() => onViewFix?.(fix)} className="bg-white text-black hover:bg-zinc-200">
                  Fix This Now <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
