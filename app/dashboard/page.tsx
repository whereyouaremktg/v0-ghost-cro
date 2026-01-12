"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Ghost, Activity, ArrowRight } from "lucide-react"

// Import Components
import { RevenueHero } from "@/components/dashboard/mission-control/revenue-hero"
import { LiveStage } from "@/components/dashboard/mission-control/live-stage" 
import { BenchmarkPanel } from "@/components/dashboard/mission-control/benchmark-panel"
import { useStoreAnalysis } from "@/hooks/use-store-analysis"

export default function DashboardPage() {
  const { data, loading } = useStoreAnalysis()
  const [optimizationLevel, setOptimizationLevel] = useState(0)

  if (loading) {
    return <div className="min-h-screen bg-[#020202] flex items-center justify-center text-white">Loading Mission Control...</div>
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white p-6 overflow-hidden">
      
      {/* --- HEADER --- */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            <Ghost className="w-5 h-5 text-[#0070F3]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Mission Control</h1>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM ACTIVE
            </div>
          </div>
        </div>
        <button className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2">
          New Scan <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* --- GRID LAYOUT --- */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        
        {/* LEFT COL: Revenue Hero (Interactive) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <RevenueHero 
            currentRevenue={42000} // Wire this to real data later
            optimizationLevel={optimizationLevel}
            setOptimizationLevel={setOptimizationLevel}
          />
          
          {/* Feed */}
          <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 overflow-hidden">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Live Intelligence</h3>
            <div className="space-y-4">
              {[1,2,3].map((_, i) => (
                <div key={i} className="flex gap-3 text-sm border-b border-white/5 pb-3">
                  <Activity className="w-4 h-4 text-[#0070F3] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white block font-medium">Friction Detected</span>
                    <span className="text-zinc-500">Cart abandonment spike on Mobile / iOS.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COL: The Stage */}
        <div className="col-span-12 lg:col-span-5">
          <LiveStage storeUrl={data?.store_url} />
        </div>

        {/* RIGHT COL: Benchmarks */}
        <div className="col-span-12 lg:col-span-3">
          <BenchmarkPanel />
        </div>

      </div>
    </div>
  )
}
