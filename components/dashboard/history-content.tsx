"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
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

function getStatusStyle(status: string) {
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

const tabs = ["All", "This Month", "Last Month"]

export function HistoryContent() {
  const [activeTab, setActiveTab] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTests = mockTests.filter((test) => test.url.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">Scan History</h1>
        <p className="text-muted-foreground">All your checkout scans</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex border-2 border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                activeTab === tab ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search scans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border-2 border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border-2 border-border brutal-shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted border-b-2 border-border">
              <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Date</th>
              <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Store</th>
              <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Personas</th>
              <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Score</th>
              <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Change</th>
              <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Issues</th>
              <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Status</th>
              <th className="text-left text-xs font-bold uppercase tracking-wide p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTests.map((test) => (
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
                <td className="p-4 font-mono text-sm">{test.issuesFound}</td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wide border-2 border-border ${getStatusStyle(test.status)}`}
                  >
                    {test.status}
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

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <button className="px-4 py-2 text-xs font-bold uppercase tracking-wide border-2 border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed">
          ← Prev
        </button>
        <button className="px-4 py-2 text-xs font-bold uppercase tracking-wide border-2 border-border bg-primary text-primary-foreground">
          1
        </button>
        <button className="px-4 py-2 text-xs font-bold uppercase tracking-wide border-2 border-border bg-card hover:bg-muted">
          2
        </button>
        <button className="px-4 py-2 text-xs font-bold uppercase tracking-wide border-2 border-border bg-card hover:bg-muted">
          Next →
        </button>
      </div>
    </div>
  )
}
