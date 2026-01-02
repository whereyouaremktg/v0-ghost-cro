interface StatCardProps {
  label: string
  value: string | number
  suffix?: string
  trend?: {
    value: string
    positive: boolean
  }
  sublabel?: string
  percentile?: string
  sparklineData?: number[] // Optional historical data for sparkline
}

// Enhanced sparkline with actual data
function Sparkline({ data, positive }: { data?: number[]; positive: boolean }) {
  // If we have real data, use it
  if (data && data.length >= 2) {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const normalized = data.map((val) => 2 + ((val - min) / range) * 10)
    const step = 60 / (normalized.length - 1)
    const points = normalized.map((y, i) => `${i * step},${y}`).join(" ")

    return (
      <svg width="60" height="16" viewBox="0 0 60 16" className="opacity-80">
        <defs>
          <linearGradient id={`sparkline-${positive}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.4} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill={`url(#sparkline-${positive})`}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={positive ? "text-primary" : "text-destructive"}
        />
      </svg>
    )
  }

  // Fallback to simple trend indicator
  const points = positive
    ? "2,12 4,10 6,8 8,6 10,4 12,2"
    : "2,4 4,6 6,8 8,10 10,12 12,14"
  
  return (
    <svg width="60" height="16" viewBox="0 0 60 16" className="opacity-60">
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

export function StatCard({ label, value, suffix, trend, sublabel, percentile, sparklineData }: StatCardProps) {
  return (
    <div className="bg-card/40 border border-border/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 card-hover animate-fade-in group">
      <div className="flex items-start justify-between mb-2">
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground/60">{label}</div>
        {trend && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkline data={sparklineData} positive={trend.positive} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1 mb-1.5">
        <span className="text-2xl font-heading font-bold">{value}</span>
        {suffix && <span className="text-sm text-muted-foreground/70">{suffix}</span>}
      </div>
      {percentile && (
        <div className="mt-1.5 text-[10px] font-medium tracking-wide text-primary/70">{percentile}</div>
      )}
      {trend && (
        <div className={`mt-1.5 text-[11px] font-medium flex items-center gap-1 ${trend.positive ? "text-primary/80" : "text-destructive/80"}`}>
          <span>{trend.positive ? "↑" : "↓"}</span>
          <span>{trend.value}</span>
        </div>
      )}
      {sublabel && <div className="mt-1.5 text-[11px] text-muted-foreground/60">{sublabel}</div>}
    </div>
  )
}
