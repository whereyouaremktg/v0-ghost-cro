import Link from "next/link"
import { mockTests } from "@/lib/mock-data"

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

export function RecentTestsTable() {
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
        <table className="w-full">
          <thead>
            <tr className="bg-muted border-b-2 border-border">
              <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Date</th>
              <th className="text-left text-xs font-bold uppercase tracking-wide p-4">URL</th>
              <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Personas</th>
              <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Score</th>
              <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Change</th>
              <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {mockTests.slice(0, 5).map((test) => (
              <tr
                key={test.id}
                className="border-b-2 border-border last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                <td className="p-4 font-mono text-sm">{formatDate(test.date)}</td>
                <td className="p-4 text-sm truncate max-w-[200px]">{test.url.replace("https://", "")}</td>
                <td className="p-4 text-sm">{test.personaMix}</td>
                <td className="p-4">
                  <span
                    className={`inline-block px-3 py-1 font-mono font-bold text-sm border-2 border-border ${getScoreColor(test.score)}`}
                  >
                    {test.score}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`font-mono font-bold text-sm ${test.change > 0 ? "text-primary" : test.change < 0 ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {test.change > 0 ? `+${test.change}` : test.change === 0 ? "—" : test.change}
                  </span>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
