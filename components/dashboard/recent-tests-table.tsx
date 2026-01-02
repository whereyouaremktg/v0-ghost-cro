import Link from "next/link"

interface Test {
  id: string
  store_url: string
  overall_score: number | null
  status: string
  created_at: string
}

interface RecentTestsTableProps {
  tests?: Test[]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getScoreColor(score: number) {
  if (score < 50) return "bg-destructive text-destructive-foreground"
  if (score < 70) return "bg-chart-5 text-foreground"
  return "bg-primary text-primary-foreground"
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return "bg-primary text-primary-foreground"
    case "running":
      return "bg-chart-5 text-foreground"
    case "failed":
      return "bg-destructive text-destructive-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function RecentTestsTable({ tests = [] }: RecentTestsTableProps) {
  // Calculate change from previous test
  const getChange = (index: number) => {
    if (index >= tests.length - 1) return 0
    const current = tests[index]?.overall_score || 0
    const previous = tests[index + 1]?.overall_score || 0
    return current - previous
  }

  return (
    <div className="bg-card border-2 border-border brutal-shadow">
      <div className="flex items-center justify-between p-4 border-b-2 border-border">
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Recent Tests</h3>
        <Link
          href="/dashboard/history"
          className="text-xs font-bold uppercase tracking-wide hover:text-primary transition-colors"
        >
          View All →
        </Link>
      </div>
      <div className="overflow-x-auto">
        {tests.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No tests run yet</p>
            <Link
              href="/dashboard/run-test"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover"
            >
              Run Your First Test
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-muted border-b-2 border-border">
                <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Date</th>
                <th className="text-left text-xs font-bold uppercase tracking-wide p-4">URL</th>
                <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Status</th>
                <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Score</th>
                <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Change</th>
                <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {tests.slice(0, 5).map((test, index) => {
                const change = getChange(index)
                return (
                  <tr
                    key={test.id}
                    className="border-b-2 border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4 font-mono text-sm">{formatDate(test.created_at)}</td>
                    <td className="p-4 text-sm truncate max-w-[200px]">{test.store_url.replace("https://", "")}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-3 py-1 font-bold text-xs uppercase border-2 border-border ${getStatusBadge(test.status)}`}
                      >
                        {test.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {test.overall_score !== null ? (
                        <span
                          className={`inline-block px-3 py-1 font-mono font-bold text-sm border-2 border-border ${getScoreColor(test.overall_score)}`}
                        >
                          {test.overall_score}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {test.status === "completed" && test.overall_score !== null ? (
                        <span
                          className={`font-mono font-bold text-sm ${change > 0 ? "text-primary" : change < 0 ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {change > 0 ? `+${change}` : change === 0 ? "—" : change}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/dashboard/test/${test.id}`}
                        className="inline-block px-4 py-2 text-xs font-bold uppercase tracking-wide border-2 border-border bg-card hover:bg-muted brutal-hover transition-all"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
