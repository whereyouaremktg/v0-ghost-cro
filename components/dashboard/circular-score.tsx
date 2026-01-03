"use client"

import { useMemo } from "react"

interface CircularScoreProps {
  score: number
  previousScore?: number
  percentile?: string | null
  historicalScores?: number[] // Array of recent scores for sparkline
}

// Enhanced sparkline with actual data
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) {
    // Fallback to simple trend indicator
    const points = positive ? "2,8 4,6 6,5 8,4 10,3 12,2" : "2,2 4,3 6,4 8,5 10,6 12,8"
    return (
      <svg width="40" height="12" viewBox="0 0 40 12" className="opacity-70">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={positive ? "text-primary" : "text-destructive"}
        />
      </svg>
    )
  }

  // Normalize data to fit in 0-12 range
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const normalized = data.map((val) => 2 + ((val - min) / range) * 10)

  // Generate points
  const step = 40 / (normalized.length - 1)
  const points = normalized.map((y, i) => `${i * step},${y}`).join(" ")

  return (
    <svg width="40" height="12" viewBox="0 0 40 12" className="opacity-80">
      <defs>
        <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="url(#sparklineGradient)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={positive ? "text-primary" : "text-destructive"}
      />
    </svg>
  )
}

export function CircularScore({ score, previousScore, percentile, historicalScores }: CircularScoreProps) {
  const hasScore = score > 0
  const scoreDiff = previousScore ? score - previousScore : 0

  // Prepare sparkline data
  const sparklineData = useMemo(() => {
    if (historicalScores && historicalScores.length > 1) {
      return [...historicalScores, score].slice(-6) // Last 6 scores
    }
    if (previousScore && score) {
      return [previousScore, score]
    }
    return []
  }, [historicalScores, previousScore, score])

  const circumference = 2 * Math.PI * 45 // radius = 45
  const offset = circumference - (score / 100) * circumference

  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
    if (score >= 60) return "text-amber-600 dark:text-amber-400"
    return "text-rose-600 dark:text-rose-400"
  }

  const getStrokeColor = () => {
    if (score >= 80) return "rgb(16 185 129)" // emerald-500
    if (score >= 60) return "rgb(245 158 11)" // amber-500
    return "rgb(244 63 94)" // rose-500
  }

  return (
    <div className="flex items-center gap-4">
      {/* Circular Progress Ring */}
      <div className="relative flex-shrink-0">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-border/20"
          />
          {/* Progress circle */}
          {hasScore && (
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={getStrokeColor()}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>
        {/* Score text in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl font-heading font-bold leading-none ${hasScore ? getScoreColor() : ""}`}>
              {hasScore ? score : "—"}
            </div>
            {hasScore && <div className="text-[10px] text-muted-foreground mt-0.5">/100</div>}
          </div>
        </div>
      </div>

      {/* Right side info */}
      <div className="flex-1 min-w-0">
        <p className="metric-label mb-2">Checkout Score</p>
        {previousScore && scoreDiff !== 0 && (
          <div className="flex items-center gap-2 mb-2">
            <Sparkline data={sparklineData} positive={scoreDiff >= 0} />
            <span className={`text-sm font-medium ${scoreDiff >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {scoreDiff >= 0 ? `+${scoreDiff}` : `${scoreDiff}`}
            </span>
            <span className="text-xs text-muted-foreground">vs last</span>
          </div>
        )}
        {!previousScore && sparklineData.length > 0 && (
          <div className="mb-2">
            <Sparkline data={sparklineData} positive={true} />
          </div>
        )}
        {percentile && (
          <div className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 mt-1">
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{percentile}</span>
          </div>
        )}
      </div>
    </div>
  )
}
