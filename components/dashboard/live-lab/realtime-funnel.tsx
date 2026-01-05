"use client"

interface FunnelStage {
  label: string
  users: number
  width: number
  color: string
  conversionRate: string
}

const funnelStages: FunnelStage[] = [
  {
    label: "Visitors",
    users: 1420,
    width: 100,
    color: "bg-zinc-200",
    conversionRate: "100%",
  },
  {
    label: "Product Views",
    users: 840,
    width: 60,
    color: "bg-zinc-300",
    conversionRate: "59%",
  },
  {
    label: "Add to Cart",
    users: 142,
    width: 20,
    color: "bg-[#0070F3]",
    conversionRate: "17%",
  },
  {
    label: "Checkout",
    users: 45,
    width: 8,
    color: "bg-zinc-800",
    conversionRate: "32%",
  },
  {
    label: "Purchased",
    users: 12,
    width: 2,
    color: "bg-emerald-500",
    conversionRate: "27%",
  },
]

export function RealtimeFunnel() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6">
      {/* Header */}
      <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6">
        LIVE TRAFFIC FLOW (LAST 30M)
      </div>

      {/* Funnel Visualization */}
      <div className="space-y-4">
        {funnelStages.map((stage, index) => (
          <div key={index} className="flex items-center gap-4">
            {/* Stage Label */}
            <div className="w-32 text-xs font-medium text-zinc-700">
              {stage.label}
            </div>

            {/* Bar Container */}
            <div className="flex-1 relative">
              <div className="h-10 bg-zinc-100 rounded-md overflow-hidden relative">
                {/* Bar */}
                <div
                  className={`h-full ${stage.color} transition-all duration-300 ${
                    stage.label === "Add to Cart" ? "animate-pulse" : ""
                  }`}
                  style={{ width: `${stage.width}%` }}
                />
              </div>
              {/* User Count - positioned outside bar */}
              <div className="absolute left-0 top-0 h-full flex items-center px-2">
                <span className="text-xs font-mono font-semibold text-zinc-900">
                  {stage.users.toLocaleString()} users
                </span>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="w-16 text-xs font-mono text-zinc-600 text-right">
              {stage.conversionRate}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

