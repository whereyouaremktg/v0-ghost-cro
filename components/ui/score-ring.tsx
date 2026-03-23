"use client"

import { cn } from "@/lib/utils"

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  className?: string
  showGrade?: boolean
}

function getGrade(score: number): { letter: string; color: string } {
  if (score >= 90) return { letter: "A", color: "hsl(var(--success))" }
  if (score >= 80) return { letter: "B", color: "hsl(var(--success))" }
  if (score >= 70) return { letter: "C", color: "hsl(var(--accent))" }
  if (score >= 60) return { letter: "D", color: "hsl(var(--warning))" }
  return { letter: "F", color: "hsl(var(--critical))" }
}

function getScoreColor(score: number): string {
  if (score >= 80) return "hsl(var(--success))"
  if (score >= 60) return "hsl(var(--accent))"
  if (score >= 40) return "hsl(var(--warning))"
  return "hsl(var(--critical))"
}

export function ScoreRing({ score, size = 120, strokeWidth = 8, className, showGrade = true }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)
  const grade = getGrade(score)

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--surface-2))"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)",
            ["--ring-circumference" as string]: circumference,
            ["--ring-offset" as string]: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-mono-data font-bold"
          style={{ fontSize: size * 0.28, color }}
        >
          {score}
        </span>
        {showGrade && (
          <span
            className="text-xs font-medium mt-0.5"
            style={{ color: grade.color }}
          >
            {grade.letter}
          </span>
        )}
      </div>
    </div>
  )
}
