"use client"

import { motion } from "framer-motion"
import { 
  Activity, 
  Bell,
  Settings,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { RevenueHero } from "@/components/dashboard/mission-control/revenue-hero"
import { LiveStage } from "@/components/dashboard/mission-control/live-stage"
import { BenchmarkPanel } from "@/components/dashboard/mission-control/benchmark-panel"
import { useStoreAnalysis } from "@/hooks/use-store-analysis"
import { calculateRevenueLeak } from "@/lib/ghostEngine"
import { calculateRevenueOpportunity } from "@/lib/calculations/revenue-opportunity"
import { getCategoryBenchmarks } from "@/lib/data/benchmarks"

export default function MissionControlDashboard() {
  const { data, loading, error, refetch } = useStoreAnalysis()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full mx-auto mb-4"
          />
          <p className="text-white/60">Loading Mission Control...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const latestTest = data.latestTest
  const store = data.store
  const shopifyMetrics = data.shopifyMetrics
  const category = data.category || "apparel"

  // Extract friction points for LiveStage
  const frictionPoints = latestTest
    ? [
        ...latestTest.frictionPoints.critical.slice(0, 3).map((fp, i) => ({
          id: fp.id || `critical_${i}`,
          label: fp.title,
          position: { x: 30 + i * 20, y: 40 + i * 15 }, // Dynamic positioning
          severity: "critical" as const,
          description: fp.fix || fp.impact,
        })),
        ...latestTest.frictionPoints.high.slice(0, 2).map((fp, i) => ({
          id: fp.id || `high_${i}`,
          label: fp.title,
          position: { x: 50 + i * 15, y: 60 + i * 10 },
          severity: "warning" as const,
          description: fp.fix || fp.impact,
        })),
      ]
    : []

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Top-left gradient */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-radial from-blue-600/10 via-blue-600/5 to-transparent rounded-full blur-3xl" />
        {/* Top-right gradient */}
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gradient-radial from-purple-600/10 via-purple-600/5 to-transparent rounded-full blur-3xl" />
        {/* Bottom gradient */}
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-blue-600/5 to-transparent rounded-full blur-3xl" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 lg:p-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
              >
                <Sparkles className="w-5 h-5 text-white" strokeWidth={1.5} />
              </motion.div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Mission Control
                </h1>
                <p className="text-sm text-white/40">
                  Ghost CRO Command Center
                </p>
              </div>
            </div>

            {/* Status pill */}
            {latestTest && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-emerald-400"
                />
                <span className="text-xs font-medium text-emerald-400">
                  Live Analysis Active
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => refetch()}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-white/60" strokeWidth={1.5} />
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Bell className="w-4 h-4 text-white/60" strokeWidth={1.5} />
              {latestTest && latestTest.frictionPoints.critical.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center">
                  {latestTest.frictionPoints.critical.length}
                </span>
              )}
            </motion.button>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Settings className="w-4 h-4 text-white/60" strokeWidth={1.5} />
            </motion.button>
          </div>
        </motion.header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Revenue Hero - Full width on mobile, 8 cols on XL */}
          <div className="xl:col-span-8">
            <RevenueHero
              currentRevenue={shopifyMetrics?.metrics?.totalRevenue || latestTest?.funnelData?.purchased * 100 || 0}
              lostToFriction={latestTest ? calculateLostRevenue(latestTest, shopifyMetrics) : undefined}
              optimizationOpportunity={latestTest ? calculateOptimizationOpportunity(latestTest, shopifyMetrics) : 0}
              testResult={latestTest}
              shopifyMetrics={shopifyMetrics}
            />
          </div>

          {/* Benchmark Panel - Full width on mobile, 4 cols on XL */}
          <div className="xl:col-span-4">
            <BenchmarkPanel
              category={category}
              percentile={latestTest ? calculatePercentile(latestTest.score) : 40}
              testResult={latestTest}
            />
          </div>

          {/* Live Stage - Full width, centered */}
          <div className="xl:col-span-12 flex justify-center">
            <LiveStage
              storeUrl={store ? `https://${store.shop}` : latestTest?.url}
              frictionPoints={frictionPoints}
              isGhostModeActive={!!latestTest}
              className="w-full max-w-2xl"
            />
          </div>
        </div>

        {/* Footer Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 py-4 px-6 rounded-2xl bg-white/[0.02] border border-white/5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
                <span className="text-xs text-white/40">System Status:</span>
                <span className="text-xs font-medium text-emerald-400">Operational</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="text-xs text-white/40">
                Last scan: <span className="text-white/60 font-mono">
                  {latestTest ? formatTimeAgo(new Date(latestTest.date)) : "Never"}
                </span>
              </div>
              {shopifyMetrics && (
                <>
                  <div className="h-4 w-px bg-white/10" />
                  <div className="text-xs text-white/40">
                    Visitors today: <span className="text-white/60 font-mono tabular-nums">
                      {Math.round((shopifyMetrics.metrics.totalSessions || 0) / 30).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-white/40">
                Powered by <span className="text-blue-400 font-medium">Ghost AI</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Helper functions
function calculateLostRevenue(test: any, metrics: any): number {
  if (!test || test.status !== "completed") return 0
  
  // Use calculateRevenueLeak from ghostEngine
  const leak = calculateRevenueLeak(test, {
    averageOrderValue: metrics?.metrics?.averageOrderValue,
    monthlySessions: metrics?.metrics?.totalSessions,
    monthlyRevenue: metrics?.metrics?.totalRevenue,
  })
  
  return leak.monthly
}

function calculateOptimizationOpportunity(test: any, metrics: any): number {
  if (!test || test.status !== "completed") return 0
  
  // Calculate opportunity using revenue opportunity calculator
  const monthlyVisitors = metrics?.metrics?.totalSessions || 50000
  const currentCR = metrics?.metrics?.conversionRate 
    ? metrics.metrics.conversionRate / 100 
    : 0.025
  const aov = metrics?.metrics?.averageOrderValue || 85
  
  // Get category benchmark
  const benchmarks = getCategoryBenchmarks("apparel") // TODO: Use actual category
  const categoryBenchmarkCR = benchmarks.avgConversionRate
  
  const opportunity = calculateRevenueOpportunity({
    monthlyVisitors,
    currentConversionRate: currentCR,
    aov,
    categoryBenchmarkCR,
  })
  
  return Math.round(opportunity.opportunityPercentage)
}

function calculatePercentile(score: number): number {
  // Convert score to percentile (inverted - lower score = lower percentile)
  if (score >= 90) return 95
  if (score >= 80) return 85
  if (score >= 70) return 70
  if (score >= 60) return 50
  if (score >= 50) return 35
  return 20
}


function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
