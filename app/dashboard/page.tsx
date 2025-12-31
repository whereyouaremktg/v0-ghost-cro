import Link from "next/link"
import { Play } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ScoreChart } from "@/components/dashboard/score-chart"
import { RecentTestsTable } from "@/components/dashboard/recent-tests-table"
import { mockStats, mockUser } from "@/lib/mock-data"

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Dashboard</h1>
        <Link
          href="/dashboard/run-test"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover"
        >
          <Play className="h-4 w-4" strokeWidth={3} />
          Run New Test
        </Link>
      </div>

      {/* Welcome Banner */}
      <div className="bg-card border-2 border-border brutal-shadow p-6 mb-8">
        <p className="text-lg">
          <span className="font-bold">Good morning, {mockUser.name.split(" ")[0]}.</span> Your checkout score is up{" "}
          <span className="text-primary font-bold">{mockStats.currentScore - mockStats.previousScore} points</span>{" "}
          since your last test.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Checkout Score"
          value={mockStats.currentScore}
          suffix="/100"
          trend={{
            value: `${mockStats.currentScore - mockStats.previousScore} vs last test`,
            positive: mockStats.currentScore > mockStats.previousScore,
          }}
        />
        <StatCard
          label="Money at Risk"
          value={`$${mockStats.moneyAtRisk.toLocaleString()}`}
          suffix="/mo"
          trend={{
            value: `$${(mockStats.previousMoneyAtRisk - mockStats.moneyAtRisk).toLocaleString()}`,
            positive: true,
          }}
        />
        <StatCard
          label="Tests Run"
          value={mockStats.testsThisMonth}
          sublabel="this month"
          trend={{
            value: `${mockStats.testsRemaining} remaining`,
            positive: true,
          }}
        />
        <StatCard label="Issues Fixed" value={mockStats.issuesFixed} sublabel="all time" />
      </div>

      {/* Chart */}
      <div className="mb-8">
        <ScoreChart />
      </div>

      {/* Recent Tests */}
      <RecentTestsTable />
    </div>
  )
}
