"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Cell } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"

interface Test {
  id: string
  overall_score: number | null
  created_at: string
}

interface ScoreChartProps {
  tests?: Test[]
}

// Calculate significant change threshold (5 points)
const SIGNIFICANT_CHANGE_THRESHOLD = 5

// Custom tooltip with better styling
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-card border border-border/50 rounded-xl shadow-xl p-3 backdrop-blur-sm animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <p className="text-sm font-heading font-semibold">{data.score}/100</p>
        </div>
        <p className="text-xs text-muted-foreground">{data.date}</p>
        {data.change && (
          <div className={`mt-2 text-xs font-medium flex items-center gap-1 ${data.change >= 0 ? "text-primary" : "text-destructive"}`}>
            {data.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {data.change >= 0 ? "+" : ""}{data.change} vs previous
          </div>
        )}
      </div>
    )
  }
  return null
}

export function ScoreChart({ tests = [] }: ScoreChartProps) {
  const chartData = useMemo(() => {
    const filtered = tests
      .filter((t) => t.overall_score !== null)
      .map((test) => ({
        id: test.id,
        score: test.overall_score,
        date: new Date(test.created_at),
        rawDate: test.created_at,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    return filtered.map((item, index) => {
      const previous = index > 0 ? filtered[index - 1].score : null
      const change = previous !== null ? (item.score || 0) - previous : null
      const isSignificant = change !== null && Math.abs(change) >= SIGNIFICANT_CHANGE_THRESHOLD

      return {
        ...item,
        date: item.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        change,
        isSignificant,
        isPositive: change !== null && change > 0,
      }
    })
  }, [tests])

  // If no data, show placeholder
  if (chartData.length === 0) {
    return (
      <div className="bg-card/40 border border-border/30 rounded-xl shadow-sm p-6 card-hover animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground font-heading">Score History</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-muted-foreground/60">
          <div className="text-center">
            <p className="text-sm mb-1">No scan data yet</p>
            <p className="text-xs">Run scans to see your score trend</p>
          </div>
        </div>
      </div>
    )
  }

  // Calculate average for reference line
  const averageScore = chartData.reduce((sum, item) => sum + (item.score || 0), 0) / chartData.length

  return (
    <div className="bg-card/40 border border-border/30 rounded-xl shadow-sm p-6 card-hover animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground font-heading mb-1">Score History</h3>
          <p className="text-[10px] text-muted-foreground/60">Track your checkout optimization progress</p>
        </div>
        {chartData.length > 1 && (
          <div className="text-right">
            <div className="text-xs text-muted-foreground/60">Avg. Score</div>
            <div className="text-lg font-heading font-bold">{Math.round(averageScore)}</div>
          </div>
        )}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fontFamily: "var(--font-heading)", fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)", strokeWidth: 1 }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fontFamily: "var(--font-heading)", fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Average reference line */}
            {chartData.length > 1 && (
              <ReferenceLine
                y={averageScore}
                stroke="var(--muted-foreground)"
                strokeDasharray="3 3"
                strokeOpacity={0.4}
                label={{ value: "Avg", position: "right", fill: "var(--muted-foreground)", fontSize: 10 }}
              />
            )}
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={(props: any) => {
                const { payload, cx, cy } = props
                return (
                  <g key={props.key}>
                    {payload.isSignificant && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="var(--primary)"
                        opacity={0.2}
                        className="animate-pulse"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={payload.isSignificant ? 5 : 3}
                      fill={payload.isSignificant ? "var(--primary)" : "var(--foreground)"}
                      stroke={payload.isSignificant ? "var(--background)" : "none"}
                      strokeWidth={payload.isSignificant ? 2 : 0}
                      className="transition-all duration-300 hover:r-6"
                    />
                  </g>
                )
              }}
              activeDot={{
                r: 7,
                fill: "var(--primary)",
                stroke: "var(--background)",
                strokeWidth: 2,
                className: "drop-shadow-lg",
              }}
              className="transition-all duration-300"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Legend for significant changes */}
      {chartData.some((d) => d.isSignificant) && (
        <div className="mt-4 pt-4 border-t border-border/20 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary border-2 border-background" />
            <span>Significant change (≥{SIGNIFICANT_CHANGE_THRESHOLD} pts)</span>
          </div>
        </div>
      )}
    </div>
  )
}
