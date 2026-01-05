"use client"

import { TrendingDown, TrendingUp } from "lucide-react"

export function VitalsMonitor() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* API Latency */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            API Latency
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-light font-mono text-zinc-900">45ms</span>
          <span className="text-xs text-emerald-600 flex items-center gap-0.5">
            <TrendingDown className="h-3 w-3" />
            12ms
          </span>
        </div>
        {/* Sparkline - Flat line */}
        <div className="mt-3 h-8">
          <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none" className="overflow-visible">
            <polyline
              points="0,15 20,15 40,15 60,15 80,15 100,15"
              fill="none"
              stroke="#71717a"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* JS Error Rate */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            JS Error Rate
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-light font-mono text-zinc-500">0.12%</span>
        </div>
        <div className="mt-3">
          <span className="text-xs text-zinc-500">Stable</span>
        </div>
      </div>

      {/* LCP (Load Time) */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            LCP (Load Time)
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-light font-mono text-emerald-600">1.2s</span>
          <span className="text-xs text-emerald-600 flex items-center gap-0.5">
            <TrendingDown className="h-3 w-3" />
            0.3s
          </span>
        </div>
        <div className="mt-3">
          <span className="text-xs text-emerald-600">Excellent</span>
        </div>
      </div>

      {/* Active Carts */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Active Carts
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-light font-mono text-blue-600">14</span>
          <span className="text-xs text-blue-600 flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" />
            3
          </span>
        </div>
        <div className="mt-3">
          <span className="text-xs text-blue-600">Live now</span>
        </div>
      </div>
    </div>
  )
}

