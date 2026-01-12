"use client"

import { motion } from "framer-motion"
import { Trophy, ArrowUpRight } from "lucide-react"

export function BenchmarkPanel() {
  const metrics = [
    { label: "Load Speed", you: 2.4, leader: 1.1, unit: "s", color: "bg-red-500" },
    { label: "Conversion", you: 1.2, leader: 3.5, unit: "%", color: "bg-yellow-500" },
    { label: "Trust Signals", you: 2, leader: 8, unit: "qty", color: "bg-blue-500" },
  ]

  return (
    <div className="h-full bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Category Leaders
          </h3>
          <p className="text-sm text-zinc-500">vs. Top 1% Apparel Brands</p>
        </div>
        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <ArrowUpRight className="w-5 h-5 text-zinc-500" />
        </button>
      </div>

      <div className="space-y-8 flex-1">
        {metrics.map((m, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">{m.label}</span>
              <span className="text-white font-mono">{m.you}{m.unit} <span className="text-zinc-600">/ {m.leader}{m.unit}</span></span>
            </div>
            {/* Bars */}
            <div className="h-3 bg-white/5 rounded-full overflow-hidden relative">
              {/* Leader Marker */}
              <div className="absolute top-0 bottom-0 w-1 bg-white/20 z-10" style={{ left: '80%' }} />
              
              {/* Your Bar */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(m.you / m.leader) * 80}%` }}
                transition={{ duration: 1, delay: 0.2 * i }}
                className={`h-full ${m.color} rounded-full`} 
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <p className="text-sm text-emerald-400 font-medium">
            🚀 Opportunity: Fixing load speed could add <strong>$4,200/mo</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
