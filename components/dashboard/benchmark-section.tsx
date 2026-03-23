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
    <div className="bg-[var(--ghost-bg-secondary)] border border-[var(--ghost-border)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Industry Benchmarks
          </h2>
          <p className="text-sm text-[var(--ghost-text-muted)]">
            Compare your store against top Shopify performers.
          </p>
        </div>
        <span className="text-xs text-[var(--ghost-text-subtle)]">Last updated 2 days ago</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="rounded-lg border border-[var(--ghost-border)] bg-[var(--ghost-bg-primary)] p-4"
          >
            <p className="text-sm text-[var(--ghost-text-muted)]">{row.label}</p>
            <p className="text-2xl font-semibold text-white">{row.value}</p>
            <p className="text-xs text-[var(--ghost-text-subtle)]">
              Benchmark: {row.benchmark}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
