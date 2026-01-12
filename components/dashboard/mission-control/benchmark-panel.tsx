"use client"

import { motion } from "framer-motion"
import { 
  Target, 
  TrendingDown, 
  Clock, 
  ShieldCheck, 
  Zap,
  ChevronRight,
  ArrowDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getCategoryBenchmark } from "@/lib/data/benchmarks"
import { getCategoryBenchmark as getCategoryLeaderBenchmark } from "@/lib/benchmarks/category-leaders"
import type { TestResult } from "@/lib/types"

interface BenchmarkMetric {
  id: string
  label: string
  icon: React.ElementType
  yourValue: number
  leaderValue: number
  unit: string
  betterIsLower?: boolean
}

interface BenchmarkPanelProps {
  category?: string
  percentile?: number
  metrics?: BenchmarkMetric[]
  testResult?: TestResult | null
  className?: string
}

const defaultMetrics: BenchmarkMetric[] = [
  {
    id: "load-speed",
    label: "Load Speed",
    icon: Clock,
    yourValue: 2.8,
    leaderValue: 1.2,
    unit: "s",
    betterIsLower: true,
  },
  {
    id: "trust-signals",
    label: "Trust Signals",
    icon: ShieldCheck,
    yourValue: 1,
    leaderValue: 4,
    unit: "",
    betterIsLower: false,
  },
  {
    id: "checkout-steps",
    label: "Checkout Steps",
    icon: Target,
    yourValue: 5,
    leaderValue: 3,
    unit: "",
    betterIsLower: true,
  },
  {
    id: "mobile-score",
    label: "Mobile UX Score",
    icon: Zap,
    yourValue: 62,
    leaderValue: 94,
    unit: "/100",
    betterIsLower: false,
  },
]

export function BenchmarkPanel({
  category = "Apparel",
  percentile = 40,
  metrics: providedMetrics,
  testResult,
  className,
}: BenchmarkPanelProps) {
  // Extract metrics from test result if available
  const metrics = providedMetrics || (testResult ? extractMetricsFromTest(testResult, category) : defaultMetrics)

  const getScoreColor = (metric: BenchmarkMetric) => {
    const ratio = metric.betterIsLower
      ? metric.leaderValue / metric.yourValue
      : metric.yourValue / metric.leaderValue

    if (ratio >= 0.9) return { status: "good", color: "emerald" }
    if (ratio >= 0.6) return { status: "warning", color: "yellow" }
    return { status: "bad", color: "red" }
  }

  const getProgressWidth = (metric: BenchmarkMetric) => {
    if (metric.betterIsLower) {
      // For metrics where lower is better (like load time)
      const maxVal = Math.max(metric.yourValue, metric.leaderValue) * 1.2
      return {
        you: ((maxVal - metric.yourValue) / maxVal) * 100,
        leader: ((maxVal - metric.leaderValue) / maxVal) * 100,
      }
    }
    // For metrics where higher is better
    const maxVal = Math.max(metric.yourValue, metric.leaderValue) * 1.1
    return {
      you: (metric.yourValue / maxVal) * 100,
      leader: (metric.leaderValue / maxVal) * 100,
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-[#0A0A0A] border border-white/10",
        "p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">
              Category Benchmark
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              Vs. Top 1% {category} Brands
            </p>
          </div>
        </div>
      </div>

      {/* Percentile Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <ArrowDown className="w-5 h-5 text-red-400" strokeWidth={1.5} />
            </motion.div>
            <div>
              <div className="text-sm font-medium text-white/80">
                Performance Ranking
              </div>
              <div className="text-xs text-white/40 mt-0.5">
                Based on conversion benchmarks
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-red-400 tabular-nums">
              Bottom {100 - percentile}%
            </div>
          </div>
        </div>

        {/* Percentile bar */}
        <div className="mt-4 relative">
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentile}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
            />
          </div>
          {/* Marker */}
          <motion.div
            initial={{ left: 0 }}
            animate={{ left: `${percentile}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-lg border-2 border-red-400" />
          </motion.div>
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-white/30">
          <span>Bottom</span>
          <span>Top 1%</span>
        </div>
      </motion.div>

      {/* Metrics Comparison */}
      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          const { status, color } = getScoreColor(metric)
          const progress = getProgressWidth(metric)

          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-white/40" strokeWidth={1.5} />
                  <span className="text-sm font-medium text-white/70">
                    {metric.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span
                    className={cn(
                      "font-mono tabular-nums font-semibold",
                      color === "red" && "text-red-400",
                      color === "yellow" && "text-yellow-400",
                      color === "emerald" && "text-emerald-400"
                    )}
                  >
                    You: {metric.yourValue}
                    {metric.unit}
                    <span className="ml-1">
                      {status === "good" && "✓"}
                      {status === "warning" && "⚠"}
                      {status === "bad" && "✗"}
                    </span>
                  </span>
                  <span className="font-mono tabular-nums text-emerald-400/80">
                    Leader: {metric.leaderValue}
                    {metric.unit} ✓
                  </span>
                </div>
              </div>

              {/* Progress bars */}
              <div className="relative h-6 bg-white/5 rounded-lg overflow-hidden">
                {/* Leader bar (background) */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.leader}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                  className="absolute inset-y-0 left-0 bg-emerald-500/20 rounded-lg"
                />
                {/* Your bar (foreground) */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.you}%` }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-lg",
                    color === "red" && "bg-gradient-to-r from-red-500/60 to-red-500/40",
                    color === "yellow" &&
                      "bg-gradient-to-r from-yellow-500/60 to-yellow-500/40",
                    color === "emerald" &&
                      "bg-gradient-to-r from-emerald-500/60 to-emerald-500/40"
                  )}
                />

                {/* Labels inside bar */}
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <span className="text-[10px] font-medium text-white/60">You</span>
                  <span className="text-[10px] font-medium text-emerald-400/60">
                    Top 1%
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full mt-6 py-3 px-4 rounded-xl",
          "bg-gradient-to-r from-blue-500/20 to-purple-500/20",
          "border border-white/10 hover:border-blue-500/30",
          "text-sm font-medium text-white/80",
          "flex items-center justify-center gap-2",
          "transition-all duration-300"
        )}
      >
        View Full Benchmark Report
        <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
      </motion.button>
    </motion.div>
  )
}

// Extract metrics from test result
function extractMetricsFromTest(test: TestResult, category: string): BenchmarkMetric[] {
  const leaderBenchmark = getCategoryLeaderBenchmark(category.toLowerCase())
  const storeAnalysis = test.storeAnalysis

  const metrics: BenchmarkMetric[] = []

  // Load Speed
  if (storeAnalysis?.technical?.pageLoadTime) {
    metrics.push({
      id: "load-speed",
      label: "Load Speed",
      icon: Clock,
      yourValue: storeAnalysis.technical.pageLoadTime,
      leaderValue: leaderBenchmark?.avg_load_time || 1.2,
      unit: "s",
      betterIsLower: true,
    })
  }

  // Trust Signals
  const trustCount = 
    (storeAnalysis?.productPage?.trustSignals?.hasReviews ? 1 : 0) +
    (storeAnalysis?.productPage?.trustSignals?.hasSecurityBadges ? 1 : 0) +
    (storeAnalysis?.productPage?.trustSignals?.hasGuarantees ? 1 : 0) +
    (storeAnalysis?.productPage?.trustSignals?.hasPaymentIcons ? 1 : 0)
  
  metrics.push({
    id: "trust-signals",
    label: "Trust Signals",
    icon: ShieldCheck,
    yourValue: trustCount,
    leaderValue: leaderBenchmark?.trust_badges_count || 3,
    unit: "",
    betterIsLower: false,
  })

  // Checkout Steps (estimate from analysis)
  const checkoutSteps = storeAnalysis?.checkout?.formFieldCount 
    ? Math.ceil(storeAnalysis.checkout.formFieldCount / 5) + 1
    : 5
  
  metrics.push({
    id: "checkout-steps",
    label: "Checkout Steps",
    icon: Target,
    yourValue: checkoutSteps,
    leaderValue: leaderBenchmark?.checkout_steps || 2,
    unit: "",
    betterIsLower: true,
  })

  // Mobile Score (based on mobile responsive flag and score)
  const mobileScore = storeAnalysis?.technical?.mobileResponsive 
    ? Math.min(100, (test.score || 0) + 20)
    : Math.max(0, (test.score || 0) - 20)
  
  metrics.push({
    id: "mobile-score",
    label: "Mobile UX Score",
    icon: Zap,
    yourValue: mobileScore,
    leaderValue: leaderBenchmark?.mobile_optimization_score || 95,
    unit: "/100",
    betterIsLower: false,
  })

  return metrics
}
