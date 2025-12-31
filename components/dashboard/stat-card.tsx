interface StatCardProps {
  label: string
  value: string | number
  suffix?: string
  trend?: {
    value: string
    positive: boolean
  }
  sublabel?: string
}

export function StatCard({ label, value, suffix, trend, sublabel }: StatCardProps) {
  return (
    <div className="bg-card border-2 border-border brutal-shadow p-6 brutal-hover">
      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-mono font-bold">{value}</span>
        {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
      </div>
      {trend && (
        <div className={`mt-2 text-sm font-bold ${trend.positive ? "text-primary" : "text-destructive"}`}>
          {trend.positive ? "↑" : "↓"} {trend.value}
        </div>
      )}
      {sublabel && <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div>}
    </div>
  )
}
