"use client"

export function RevenueHero() {
  // Sparkline data - mostly flat/gray, ending with a blue uptick
  const sparklineData = [
    { x: 0, y: 50 },
    { x: 10, y: 48 },
    { x: 20, y: 52 },
    { x: 30, y: 49 },
    { x: 40, y: 51 },
    { x: 50, y: 50 },
    { x: 60, y: 48 },
    { x: 70, y: 52 },
    { x: 80, y: 55 },
    { x: 90, y: 58 },
    { x: 100, y: 62 },
  ]

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6">
      {/* Title */}
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-4">
        RECOVERABLE REVENUE DETECTED
      </div>

      {/* Main Number */}
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-5xl font-light tracking-tight text-zinc-900 font-mono">
          $14,250
        </span>
        <span className="text-xl text-zinc-400 font-mono">/ mo</span>
      </div>

      {/* Sparkline */}
      <div className="mb-6 h-12 relative">
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

      {/* Footer Status */}
      <div className="flex items-center gap-2 text-xs text-zinc-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        <span>Analysis complete. 24% of traffic is recoverable.</span>
      </div>
    </div>
  )
}

