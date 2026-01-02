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
    if (score >= 80) return "text-primary"
    if (score >= 60) return "text-chart-2"
    return "text-destructive"
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
          {/* Progress circle with gradient effect */}
          {hasScore && (
            <>
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: "drop-shadow(0 0 8px rgba(168,224,99,0.3))",
                }}
              />
            </>
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
        <div className="text-[10px] font-medium tracking-wide text-muted-foreground mb-1.5">Ghost Score</div>
        {previousScore && scoreDiff !== 0 && (
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkline data={sparklineData} positive={scoreDiff >= 0} />
            <span className={`text-xs font-medium ${scoreDiff >= 0 ? "text-primary" : "text-destructive"}`}>
              {scoreDiff >= 0 ? `+${scoreDiff}` : `${scoreDiff}`}
            </span>
            <span className="text-[10px] text-muted-foreground">vs last</span>
          </div>
        )}
        {!previousScore && sparklineData.length > 0 && (
          <div className="mb-1.5">
            <Sparkline data={sparklineData} positive={true} />
          </div>
        )}
        {percentile && (
          <div className="text-[10px] text-muted-foreground">{percentile}</div>
        )}
      </div>
    </div>
  )
}
