"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, Scan, AlertCircle, Signal } from "lucide-react"
import { cn } from "@/lib/utils"

interface FrictionPoint {
  id: string
  label: string
  position: { x: number; y: number }
  severity: "critical" | "warning" | "info"
  description: string
}

interface LiveStageProps {
  storeUrl?: string
  frictionPoints?: FrictionPoint[]
  isGhostModeActive?: boolean
  className?: string
}

const defaultFrictionPoints: FrictionPoint[] = [
  {
    id: "header",
    label: "Header",
    position: { x: 50, y: 8 },
    severity: "warning",
    description: "Navigation too complex",
  },
  {
    id: "atc",
    label: "Add to Cart",
    position: { x: 70, y: 65 },
    severity: "critical",
    description: "Low contrast CTA button",
  },
  {
    id: "trust",
    label: "Trust Signals",
    position: { x: 30, y: 85 },
    severity: "critical",
    description: "Missing trust badges",
  },
]

export function LiveStage({
  storeUrl = "https://placeholder.com",
  frictionPoints = defaultFrictionPoints,
  isGhostModeActive = true,
  className,
}: LiveStageProps) {
  const [activePoint, setActivePoint] = useState<string | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [iframeError, setIframeError] = useState(false)

  // Simulate scanning animation
  useEffect(() => {
    if (isGhostModeActive) {
      const interval = setInterval(() => {
        setScanProgress((prev) => (prev >= 100 ? 0 : prev + 0.5))
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isGhostModeActive])

  // If no store URL, show placeholder
  const displayUrl = storeUrl && storeUrl !== "https://placeholder.com" 
    ? storeUrl 
    : null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
            <Eye className="w-5 h-5 text-purple-400" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">
              Live Stage
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              {displayUrl ? "Real-time preview" : "No store connected"}
            </p>
          </div>
        </div>

        {/* Ghost Mode Indicator */}
        <motion.div
          animate={{ opacity: isGhostModeActive ? 1 : 0.5 }}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full",
            isGhostModeActive
              ? "bg-purple-500/10 border border-purple-500/20"
              : "bg-white/5 border border-white/10"
          )}
        >
          <motion.div
            animate={{ scale: isGhostModeActive ? [1, 1.2, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={cn(
              "w-2 h-2 rounded-full",
              isGhostModeActive ? "bg-purple-400" : "bg-white/40"
            )}
          />
          <span
            className={cn(
              "text-xs font-medium",
              isGhostModeActive ? "text-purple-400" : "text-white/40"
            )}
          >
            Ghost Mode {isGhostModeActive ? "Active" : "Inactive"}
          </span>
        </motion.div>
      </div>

      {/* iPhone Mockup Container */}
      <div className="relative flex items-center justify-center py-4">
        {/* iPhone 14 Pro Frame */}
        <div className="relative">
          {/* Outer frame */}
          <div
            className={cn(
              "relative w-[280px] h-[570px] rounded-[50px]",
              "bg-gradient-to-b from-zinc-800 to-zinc-900",
              "p-[3px]",
              "shadow-[0_0_60px_rgba(0,0,0,0.6),inset_0_0_20px_rgba(255,255,255,0.05)]"
            )}
          >
            {/* Inner bezel */}
            <div className="relative w-full h-full rounded-[47px] bg-[#0A0A0A] overflow-hidden">
              {/* Dynamic Island */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[100px] h-[30px] bg-black rounded-full z-20 flex items-center justify-center">
                <motion.div
                  animate={{
                    width: isGhostModeActive ? 86 : 30,
                    height: isGhostModeActive ? 26 : 26,
                  }}
                  className="bg-black rounded-full flex items-center justify-center gap-1.5 px-2"
                >
                  {isGhostModeActive && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1"
                      >
                        <Scan className="w-3 h-3 text-purple-400" />
                        <span className="text-[9px] font-medium text-purple-400">
                          SCANNING
                        </span>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </div>

              {/* Screen content - iframe or placeholder */}
              <div className="absolute inset-0 pt-12 bg-gradient-to-b from-zinc-900/50 to-[#0A0A0A]">
                {displayUrl && !iframeError ? (
                  <iframe
                    src={displayUrl}
                    className="w-full h-full border-0"
                    onError={() => setIframeError(true)}
                    sandbox="allow-same-origin allow-scripts"
                    title="Store Preview"
                  />
                ) : (
                  <div className="h-full w-full bg-[#111] overflow-hidden">
                    {/* Mock header */}
                    <div className="h-12 bg-[#0A0A0A] border-b border-white/5 flex items-center px-4">
                      <div className="w-6 h-6 rounded bg-white/10" />
                      <div className="flex-1 mx-4">
                        <div className="w-24 h-3 bg-white/10 rounded mx-auto" />
                      </div>
                      <div className="w-6 h-6 rounded bg-white/10" />
                    </div>

                    {/* Mock product image */}
                    <div className="h-40 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 m-4 rounded-lg flex items-center justify-center">
                      <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10" />
                    </div>

                    {/* Mock product info */}
                    <div className="px-4 space-y-3">
                      <div className="w-3/4 h-4 bg-white/10 rounded" />
                      <div className="w-1/2 h-3 bg-white/5 rounded" />
                      <div className="w-20 h-5 bg-white/10 rounded mt-4" />
                    </div>

                    {/* Mock add to cart button */}
                    <div className="absolute bottom-16 left-4 right-4">
                      <div className="h-12 bg-white/5 rounded-lg border border-white/10" />
                    </div>
                  </div>
                )}
              </div>

              {/* Scan line overlay */}
              {isGhostModeActive && (
                <motion.div
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/80 to-transparent pointer-events-none z-10"
                  style={{ top: `${scanProgress}%` }}
                />
              )}

              {/* Friction Point Overlays */}
              <AnimatePresence>
                {isGhostModeActive &&
                  frictionPoints.map((point) => (
                    <motion.div
                      key={point.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ delay: Math.random() * 0.3 }}
                      className="absolute z-20"
                      style={{
                        left: `${point.position.x}%`,
                        top: `${point.position.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onMouseEnter={() => setActivePoint(point.id)}
                      onMouseLeave={() => setActivePoint(null)}
                    >
                      {/* Pulse ring */}
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={cn(
                          "absolute inset-0 rounded-full -m-2",
                          point.severity === "critical" && "bg-red-500/30",
                          point.severity === "warning" && "bg-yellow-500/30",
                          point.severity === "info" && "bg-blue-500/30"
                        )}
                      />

                      {/* Point marker */}
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        className={cn(
                          "w-4 h-4 rounded-full cursor-pointer",
                          "flex items-center justify-center",
                          "shadow-lg",
                          point.severity === "critical" &&
                            "bg-red-500 shadow-red-500/50",
                          point.severity === "warning" &&
                            "bg-yellow-500 shadow-yellow-500/50",
                          point.severity === "info" &&
                            "bg-blue-500 shadow-blue-500/50"
                        )}
                      >
                        <AlertCircle className="w-2.5 h-2.5 text-white" strokeWidth={2} />
                      </motion.div>

                      {/* Tooltip */}
                      <AnimatePresence>
                        {activePoint === point.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.9 }}
                            className={cn(
                              "absolute top-full mt-2 left-1/2 -translate-x-1/2",
                              "px-3 py-2 rounded-lg",
                              "bg-[#1a1a1a] border border-white/10",
                              "whitespace-nowrap z-30"
                            )}
                          >
                            <div className="text-xs font-semibold text-white">
                              {point.label}
                            </div>
                            <div className="text-[10px] text-white/60 mt-0.5">
                              {point.description}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Side buttons */}
          <div className="absolute left-[-2px] top-[120px] w-[3px] h-8 bg-zinc-700 rounded-l" />
          <div className="absolute left-[-2px] top-[170px] w-[3px] h-14 bg-zinc-700 rounded-l" />
          <div className="absolute left-[-2px] top-[230px] w-[3px] h-14 bg-zinc-700 rounded-l" />
          <div className="absolute right-[-2px] top-[160px] w-[3px] h-20 bg-zinc-700 rounded-r" />
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Signal className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
          <span className="text-xs text-white/40">
            {frictionPoints.length} friction points detected
          </span>
        </div>

        <div className="flex items-center gap-3">
          {frictionPoints.filter((p) => p.severity === "critical").length > 0 && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {frictionPoints.filter((p) => p.severity === "critical").length} Critical
            </span>
          )}
          {frictionPoints.filter((p) => p.severity === "warning").length > 0 && (
            <span className="text-xs text-yellow-400 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              {frictionPoints.filter((p) => p.severity === "warning").length} Warning
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
