type BenchmarkProps = {
  storeMetrics: {
    conversionRate: number
    aov: number
    revenuePerVisitor: number
  }
  industryBenchmarks: {
    conversionRate: number
    aov: number
    revenuePerVisitor: number
  }
}

export function BenchmarkSection({
  storeMetrics,
  industryBenchmarks,
}: BenchmarkProps) {
  const rows = [
    {
      label: "Conversion Rate",
      value: `${storeMetrics.conversionRate}%`,
      benchmark: `${industryBenchmarks.conversionRate}%`,
    },
    {
      label: "Average Order Value",
      value: `$${storeMetrics.aov}`,
      benchmark: `$${industryBenchmarks.aov}`,
    },
    {
      label: "Revenue per Visitor",
      value: `$${storeMetrics.revenuePerVisitor}`,
      benchmark: `$${industryBenchmarks.revenuePerVisitor}`,
    },
  ]

  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Industry Benchmarks
          </h2>
          <p className="text-sm text-[#9CA3AF]">
            Compare your store against top Shopify performers.
          </p>
        </div>
        <span className="text-xs text-[#6B7280]">Last updated 2 days ago</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-4"
          >
            <p className="text-sm text-[#9CA3AF]">{row.label}</p>
            <p className="text-2xl font-semibold text-white">{row.value}</p>
            <p className="text-xs text-[#6B7280]">
              Benchmark: {row.benchmark}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
