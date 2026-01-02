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
    <div className="bg-card/40 border border-border/30 rounded-xl shadow-sm card-hover animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground font-heading">Recent Scans</h3>
        <Link
          href="/dashboard/history"
          className="text-xs font-medium tracking-wide hover:text-primary transition-colors duration-300"
        >
          View All →
        </Link>
      </div>
      <div className="overflow-x-auto">
        {tests.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No scans yet</p>
            <p className="text-sm text-muted-foreground">Ghost is analyzing your store. Results will appear here shortly.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30 border-b border-border/30">
                <th className="text-left text-xs font-medium tracking-wide p-4 text-muted-foreground">Date</th>
                <th className="text-left text-xs font-medium tracking-wide p-4 text-muted-foreground">Store</th>
                <th className="text-left text-xs font-medium tracking-wide p-4 text-muted-foreground">Status</th>
                <th className="text-left text-xs font-medium tracking-wide p-4 text-muted-foreground">Score</th>
                <th className="text-left text-xs font-medium tracking-wide p-4 text-muted-foreground">Change</th>
                <th className="text-left text-xs font-medium tracking-wide p-4 text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {tests.slice(0, 5).map((test, index) => {
                const change = getChange(index)
                return (
                  <tr
                    key={test.id}
                    className="border-b border-border/20 last:border-b-0 hover:bg-muted/30 transition-all duration-300"
                  >
                    <td className="p-4 text-sm">{formatDate(test.created_at)}</td>
                    <td className="p-4 text-sm truncate max-w-[200px]">{test.store_url.replace("https://", "")}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-3 py-1 font-medium text-xs rounded-lg border border-border/30 ${getStatusBadge(test.status)}`}
                      >
                        {test.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {test.overall_score !== null ? (
                        <span
                          className={`inline-block px-3 py-1 font-heading font-bold text-sm rounded-lg border border-border/30 ${getScoreColor(test.overall_score)}`}
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
                          className={`font-heading font-bold text-sm ${change > 0 ? "text-primary" : change < 0 ? "text-destructive" : "text-muted-foreground"}`}
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
                        className="inline-block px-4 py-2 text-xs font-medium tracking-wide rounded-xl border border-border/30 bg-card/50 hover:bg-muted/50 transition-all duration-300 hover:-translate-y-0.5"
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
