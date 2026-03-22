"use client"

import { TrendingDown, TrendingUp } from "lucide-react"

import { ScoreGauge } from "@/components/ui/score-gauge"
import { cn } from "@/lib/utils"

type ScoreHeroCardProps = {
  score: number
  previousScore: number
  scanDate: string
}

function getLetterGrade(score: number) {
  if (score >= 85) return "A"
  if (score >= 70) return "B"
  if (score >= 60) return "C"
  if (score >= 50) return "D"
  return "F"
}

export function ScoreHeroCard({
  score,
  previousScore,
  scanDate,
}: ScoreHeroCardProps) {
  const trend = score - previousScore
  const trendPositive = trend >= 0

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1F1F1F] bg-[#111111] p-8 card-shine">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 50%, rgba(251,191,36,0.03) 0%, transparent 60%)",
        }}
      />
      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div>
          <p className="label-uppercase mb-1">Store Health Score</p>
          <div className="flex items-baseline gap-3">
            <span className="text-7xl font-bold text-white text-mono-data">{score}</span>
            <span className="text-3xl text-[#6B7280] text-mono-data">/100</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs",
                trendPositive
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400",
              )}
            >
              {trendPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trendPositive ? "+" : ""}
              {trend} pts
            </span>
            <span className="text-[#6B7280] text-sm">from last scan</span>
          </div>
          <p className="text-[#6B7280] text-sm mt-4">
            Your store converts{" "}
            <span className="font-semibold text-[#FBBF24]">{100 - score}% below</span> top
            performers.
          </p>
          <p className="text-xs text-[#4B5563] mt-2">
            Last scan: {scanDate}
          </p>
        </div>

        <div className="relative">
          <ScoreGauge score={score} size={180} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">
              {getLetterGrade(score)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
