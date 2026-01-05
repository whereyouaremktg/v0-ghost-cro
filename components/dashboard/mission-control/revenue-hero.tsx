"use client"

export function RevenueHero() {
  // Sparkline data - simple wave ending with blue uptick
  const sparklineData = [
    { x: 0, y: 50 },
    { x: 20, y: 48 },
    { x: 40, y: 52 },
    { x: 60, y: 49 },
    { x: 80, y: 51 },
    { x: 100, y: 58 },
  ]

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6 h-full">
      {/* Header */}
      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-4">
        RECOVERABLE REVENUE DETECTED
      </div>

      {/* Main Number with Trend Badge */}
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-5xl font-light tracking-tight text-zinc-900 font-mono">
          $14,250
        </span>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
          +12.5%
        </span>
      </div>

      {/* Sparkline */}
      <div className="mb-6 h-10 relative">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {/* Gray portion (first 90%) */}
          <polyline
            points={sparklineData
              .filter((_, i) => i < sparklineData.length - 1)
              .map((p) => `${p.x},${60 - p.y}`)
              .join(" ")}
            fill="none"
            stroke="#71717a"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Blue portion (last segment) */}
          <polyline
            points={`${sparklineData[sparklineData.length - 2].x},${
              60 - sparklineData[sparklineData.length - 2].y
            } ${sparklineData[sparklineData.length - 1].x},${
              60 - sparklineData[sparklineData.length - 1].y
            }`}
            fill="none"
            stroke="#0070F3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Footer */}
      <div className="text-xs text-zinc-500">
        Based on 4 detected high-impact leaks.
      </div>
    </div>
  )
}
