"use client"

import { TrendingDown, TrendingUp } from "lucide-react"

export function VitalsMonitor() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* API Latency */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            API Latency
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-light font-mono text-white tabular-nums">45ms</span>
          <span className="text-xs text-emerald-500 flex items-center gap-0.5">
            <TrendingDown className="h-3 w-3" />
            12ms
          </span>
        </div>
        {/* Sparkline */}
        <div className="mt-3 h-8">
          <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none" className="overflow-visible">
            <polyline
              points="0,15 20,15 40,15 60,15 80,15 100,15"
              fill="none"
              stroke="#3f3f46"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* JS Error Rate */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            JS Error Rate
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-light font-mono text-zinc-400 tabular-nums">0.12%</span>
        </div>
        <div className="mt-3">
          <span className="text-xs text-zinc-500">Stable</span>
        </div>
      </div>

      {/* LCP (Load Time) */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            LCP (Load Time)
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-light font-mono text-emerald-500 tabular-nums">1.2s</span>
          <span className="text-xs text-emerald-500 flex items-center gap-0.5">
            <TrendingDown className="h-3 w-3" />
            0.3s
          </span>
        </div>
        <div className="mt-3">
          <span className="text-xs text-emerald-500">Excellent</span>
        </div>
      </div>

      {/* Active Carts */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Active Carts
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-light font-mono text-[#0070F3] tabular-nums">14</span>
          <span className="text-xs text-[#0070F3] flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" />
            3
          </span>
        </div>
        <div className="mt-3">
          <span className="text-xs text-[#0070F3]">Live now</span>
        </div>
      </div>
    </div>
  )
}
