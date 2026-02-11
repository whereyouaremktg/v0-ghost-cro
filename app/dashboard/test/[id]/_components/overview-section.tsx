"use client"

import { useState, useEffect } from "react"
import {
  TrendingDown,
  DollarSign,
  Target,
} from "lucide-react"
import type { TestResult } from "@/lib/types"
import { formatCurrency } from "@/lib/utils/format"
import { getScoreColor, getBriefIcon } from "./shared"

// ── Animated Counter ──────────────────────────────────────────────
// Exported for reuse in recovery-section.tsx
export function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now()

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor(value * easeOut)

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return <span>{displayValue.toLocaleString()}</span>
}

// ── Sparkline ─────────────────────────────────────────────────────
function Sparkline({ data, width = 60, height = 20, color = "blue" }: { data: number[]; width?: number; height?: number; color?: string }) {
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(" ")

  const colorClass = color === "blue" ? "stroke-blue-500" : color === "red" ? "stroke-red-500" : "stroke-gray-400"

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        strokeWidth="1.5"
        className={colorClass}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Overview Section ──────────────────────────────────────────────

interface OverviewSectionProps {
  test: TestResult
  revenueLeak: { monthly: number; weekly: number; daily: number }
  allThreatsCount: number
  purchaseRate: number
  purchaseCount: number
  abandonCount: number
  executiveBrief: string[]
  isHighlighted: boolean
  visibleSections: Set<string>
  sectionRef: React.Ref<HTMLDivElement>
}

export function OverviewSection({
  test,
  revenueLeak,
  purchaseRate,
  purchaseCount,
  abandonCount,
  executiveBrief,
  isHighlighted,
  visibleSections,
  sectionRef,
}: OverviewSectionProps) {
  return (
    <section
      id="overview"
      ref={sectionRef}
      data-section-id="overview"
      className={`mb-20 scroll-mt-24 section-scroll-in ${visibleSections.has("overview") ? "visible" : ""} ${isHighlighted ? "animate-highlight-flash" : ""}`}
    >
      {/* Ghost Summary Executive Brief */}
      <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-8 mb-10 backdrop-blur-xl" style={{background: "rgba(255, 255, 255, 0.95)"}}>
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex-shrink-0">
            <Target className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold font-heading mb-1 text-gray-900">Ghost Summary</h2>
            <p className="text-xs text-gray-500">Executive brief of your checkout performance</p>
          </div>
        </div>
        <ul className="space-y-3">
          {executiveBrief.map((point, index) => {
            const BriefIcon = getBriefIcon(point)
            return (
              <li key={index} className="flex items-start gap-3 text-sm leading-relaxed">
                <div className="p-1 bg-blue-50 border border-blue-200 rounded-lg mt-0.5 flex-shrink-0">
                  <BriefIcon className="h-4 w-4 text-blue-600" strokeWidth={2} />
                </div>
                <span className="text-gray-900">{point}</span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Revenue Leak Hero */}
      <div className="bg-gradient-to-br from-red-50 via-red-50/50 to-gray-50 border border-red-200 rounded-[16px] shadow-sm p-10 mb-10 backdrop-blur-xl" style={{background: "linear-gradient(to bottom right, rgba(254, 242, 242, 0.9), rgba(249, 250, 251, 0.9))"}}>
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-red-100 border border-red-200 rounded-xl">
            <TrendingDown className="h-6 w-6 text-red-600" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold font-heading mb-1 text-gray-900">Estimated Revenue Leak</h2>
            <p className="text-sm text-gray-600">Monthly revenue lost due to checkout friction</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-[16px] p-8 shadow-sm card-hover-lift backdrop-blur-xl" style={{background: "rgba(255, 255, 255, 0.95)"}}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" strokeWidth={2} />
                <div className="text-xs font-medium tracking-wide text-gray-500">Monthly Leak</div>
              </div>
              <Sparkline data={[revenueLeak.monthly * 0.8, revenueLeak.monthly * 0.9, revenueLeak.monthly * 0.85, revenueLeak.monthly]} color="red" />
            </div>
            <div className="text-5xl font-heading font-bold text-red-600 leading-none mb-2">
              {formatCurrency(revenueLeak.monthly || 0)}
            </div>
            <div className="text-xs text-gray-500">per month</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-[16px] p-8 shadow-sm card-hover-lift backdrop-blur-xl" style={{background: "rgba(255, 255, 255, 0.95)"}}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" strokeWidth={2} />
                <div className="text-xs font-medium tracking-wide text-gray-500">Weekly Leak</div>
              </div>
              <Sparkline data={[revenueLeak.weekly * 0.8, revenueLeak.weekly * 0.9, revenueLeak.weekly * 0.85, revenueLeak.weekly]} color="red" />
            </div>
            <div className="text-4xl font-heading font-bold text-red-600 leading-none mb-2">
              {formatCurrency(revenueLeak.weekly || 0)}
            </div>
            <div className="text-xs text-gray-500">per week</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-[16px] p-8 shadow-sm card-hover-lift backdrop-blur-xl" style={{background: "rgba(255, 255, 255, 0.95)"}}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" strokeWidth={2} />
                <div className="text-xs font-medium tracking-wide text-gray-500">Daily Leak</div>
              </div>
              <Sparkline data={[revenueLeak.daily * 0.8, revenueLeak.daily * 0.9, revenueLeak.daily * 0.85, revenueLeak.daily]} color="red" />
            </div>
            <div className="text-4xl font-heading font-bold text-red-600 leading-none mb-2">
              {formatCurrency(revenueLeak.daily || 0)}
            </div>
            <div className="text-xs text-gray-500">per day</div>
          </div>
        </div>
      </div>

      {/* Score & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-[16px] shadow-sm p-8 text-center card-hover-lift">
          <div className="text-xs font-medium tracking-wide text-gray-500 mb-3">Ghost Score</div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className={`text-6xl font-heading font-bold leading-none ${getScoreColor(test.score)}`}>
              <AnimatedCounter value={test.score} duration={1500} />
            </div>
            {test.previousScore && (
              <div className="mt-2">
                <Sparkline data={[test.previousScore, test.previousScore + (test.score - test.previousScore) * 0.3, test.previousScore + (test.score - test.previousScore) * 0.7, test.score]} color={test.score >= test.previousScore ? "blue" : "red"} />
              </div>
            )}
          </div>
          <div className="text-sm text-gray-500">/100</div>
          {test.change && (
            <div className={`text-sm font-medium mt-4 ${test.change >= 0 ? "text-blue-600" : "text-red-600"}`}>
              {test.change >= 0 ? "+" : ""}{test.change} vs previous
            </div>
          )}
        </div>
        <div className="lg:col-span-3 grid grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-6 card-hover-lift backdrop-blur-xl" style={{background: "rgba(255, 255, 255, 0.95)"}}>
            <div className="text-xs font-medium tracking-wide text-gray-500 mb-2">Would Purchase</div>
            <div className="text-3xl font-heading font-bold text-blue-600">{purchaseRate}%</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-6 card-hover-lift backdrop-blur-xl" style={{background: "rgba(255, 255, 255, 0.95)"}}>
            <div className="text-xs font-medium tracking-wide text-gray-500 mb-2">Purchased</div>
            <div className="text-3xl font-heading font-bold text-blue-600">{purchaseCount}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-6 card-hover-lift backdrop-blur-xl" style={{background: "rgba(255, 255, 255, 0.95)"}}>
            <div className="text-xs font-medium tracking-wide text-gray-500 mb-2">Abandoned</div>
            <div className="text-3xl font-heading font-bold text-red-600">{abandonCount}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
