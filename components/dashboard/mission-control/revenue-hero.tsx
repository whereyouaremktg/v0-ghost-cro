"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, TrendingDown, Zap, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { calculateRevenueLeak } from "@/lib/ghostEngine"
import type { TestResult } from "@/lib/types"

interface RevenueHeroProps {
  currentRevenue?: number
  lostToFriction?: number
  optimizationOpportunity?: number
  testResult?: TestResult | null
  shopifyMetrics?: {
    metrics: {
      totalRevenue: number
      averageOrderValue: number
      totalSessions: number
    }
  } | null
  optimizationLevel?: number
  setOptimizationLevel?: (value: number) => void
  className?: string
}

export function RevenueHero({
  currentRevenue = 42000,
  lostToFriction: providedLostToFriction,
  optimizationOpportunity = 12,
  testResult,
  shopifyMetrics,
  optimizationLevel: externalOptimizationLevel,
  setOptimizationLevel: externalSetOptimizationLevel,
  className,
}: RevenueHeroProps) {
  const [internalOptimizationLevel, setInternalOptimizationLevel] = useState(0)
  const optimizationLevel = externalOptimizationLevel !== undefined ? externalOptimizationLevel : internalOptimizationLevel
  const setOptimizationLevel = externalSetOptimizationLevel || setInternalOptimizationLevel
  const [displayedRevenue, setDisplayedRevenue] = useState(currentRevenue)
  const [isAnimating, setIsAnimating] = useState(false)

  // Calculate lost revenue dynamically if testResult is provided
  const lostToFriction = useMemo(() => {
    if (providedLostToFriction !== undefined) {
      return providedLostToFriction
    }
    if (testResult && testResult.status === "completed") {
      const leak = calculateRevenueLeak(testResult, {
        averageOrderValue: shopifyMetrics?.metrics?.averageOrderValue,
        monthlySessions: shopifyMetrics?.metrics?.totalSessions,
        monthlyRevenue: shopifyMetrics?.metrics?.totalRevenue || currentRevenue,
      })
      return leak.monthly
    }
    return 4500 // Default fallback
  }, [providedLostToFriction, testResult, shopifyMetrics, currentRevenue])

  // Calculate projected revenue based on slider
  // As optimization level increases, we recover more of the lost revenue
  const maxRecovery = lostToFriction * (optimizationOpportunity / 100)
  const projectedGain = (optimizationLevel / 100) * maxRecovery
  const projectedRevenue = currentRevenue + projectedGain

  // Smooth number animation
  useEffect(() => {
    setIsAnimating(true)
    const duration = 300
    const startValue = displayedRevenue
    const endValue = projectedRevenue
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (endValue - startValue) * easeOut
      
      setDisplayedRevenue(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animate)
  }, [projectedRevenue, displayedRevenue])

  // Format currency with tabular nums
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-[#0A0A0A] border border-white/10",
        "p-8",
        className
      )}
    >
      {/* Ambient glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-blue-500/10 via-purple-500/5 to-transparent opacity-50 blur-3xl pointer-events-none" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                Revenue Simulator
              </h2>
              <p className="text-xs text-white/40 mt-0.5">Real-time projection</p>
            </div>
          </div>
          
          {lostToFriction > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" strokeWidth={1.5} />
              <span className="text-xs font-medium text-red-400">Leaks Detected</span>
            </div>
          )}
        </div>

        {/* Main Revenue Display */}
        <div className="grid grid-cols-3 gap-8 mb-10">
          {/* Current Revenue */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
              Current Monthly
            </span>
            <div className="font-mono text-3xl font-semibold text-white/80 tabular-nums tracking-tight">
              {formatCurrency(currentRevenue)}
            </div>
          </div>

          {/* Lost to Friction */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-white/40 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-3 h-3 text-red-400" />
              Lost to Friction
            </span>
            <div className="font-mono text-3xl font-semibold text-red-400 tabular-nums tracking-tight">
              -{formatCurrency(lostToFriction)}
            </div>
          </div>

          {/* Optimization Opportunity */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-white/40 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Opportunity
            </span>
            <div className="font-mono text-3xl font-semibold text-emerald-400 tabular-nums tracking-tight">
              +{optimizationOpportunity}%
            </div>
          </div>
        </div>

        {/* Projected Revenue - Hero Number */}
        <div className="text-center py-8 mb-8">
          <span className="text-sm font-medium text-white/40 uppercase tracking-wider block mb-4">
            Projected Monthly Revenue
          </span>
          <motion.div
            className={cn(
              "font-mono text-7xl font-bold tabular-nums tracking-tighter",
              "bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent",
              "drop-shadow-[0_0_40px_rgba(147,51,234,0.3)]",
              isAnimating && "animate-pulse"
            )}
          >
            {formatCurrency(displayedRevenue)}
          </motion.div>
          
          {/* Gain indicator */}
          <AnimatePresence mode="wait">
            {projectedGain > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                <span className="text-sm font-medium text-emerald-400 tabular-nums">
                  +{formatCurrency(projectedGain)}/mo with optimization
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Optimization Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/60">
              Optimization Level
            </span>
            <span className="text-sm font-mono font-semibold text-white/80 tabular-nums">
              {optimizationLevel}%
            </span>
          </div>
          
          <div className="relative">
            {/* Track background */}
            <div className="h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden">
              {/* Progress fill with gradient */}
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
                style={{ width: `${optimizationLevel}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
            
            {/* Slider input */}
            <input
              type="range"
              min="0"
              max="100"
              value={optimizationLevel}
              onChange={(e) => setOptimizationLevel(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {/* Custom thumb */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-[0_0_20px_rgba(147,51,234,0.5)] border-2 border-purple-400 pointer-events-none"
              style={{ left: `calc(${optimizationLevel}% - 10px)` }}
              whileHover={{ scale: 1.1 }}
            />
          </div>
          
          {/* Scale labels */}
          <div className="flex items-center justify-between text-xs text-white/30">
            <span>Current State</span>
            <span>Fully Optimized</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
