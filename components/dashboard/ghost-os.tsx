"use client"

import Link from "next/link"
import { Ghost, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react"
import type { TestResult } from "@/lib/types"

interface GhostOSProps {
  user: {
    id: string
    email: string
    name: string
  }
  stats: {
    currentScore: number
    previousScore: number
    testsThisMonth: number
    testsRemaining: number
    testsLimit: number
    plan: string
  }
  tests: any[]
  latestTestResult: TestResult | null
}

export function GhostOS({ user, stats, tests, latestTestResult }: GhostOSProps) {
  const hasTests = tests.length > 0
  const latestTest = tests[0]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, {user.name}
        </h1>
        <p className="text-zinc-400">
          {stats.plan === "free"
            ? "Upgrade to unlock more scans"
            : `${stats.testsRemaining} scans remaining this month`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="text-sm text-zinc-400 mb-1">Current Score</div>
          <div className="text-3xl font-bold text-white">{stats.currentScore || "—"}</div>
        </div>
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="text-sm text-zinc-400 mb-1">Tests This Month</div>
          <div className="text-3xl font-bold text-white">{stats.testsThisMonth}</div>
        </div>
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="text-sm text-zinc-400 mb-1">Plan</div>
          <div className="text-3xl font-bold text-white capitalize">{stats.plan}</div>
        </div>
      </div>

      {/* Latest Test Result */}
      {hasTests && latestTest ? (
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Latest Scan</h2>
            <Link
              href={`/dashboard/test/${latestTest.id}`}
              className="text-sm text-[#FBBF24] hover:text-[#FCD34D] flex items-center gap-1"
            >
              View Details <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                (latestTest.overall_score || 0) >= 70
                  ? "bg-green-500/20 text-green-400"
                  : (latestTest.overall_score || 0) >= 50
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
              }`}>
                {latestTest.overall_score || 0}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-white font-medium truncate">
                {latestTest.url || "Unknown URL"}
              </div>
              <div className="text-sm text-zinc-400">
                {new Date(latestTest.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {latestTestResult?.frictionPoints && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-4 text-sm">
                {latestTestResult.frictionPoints.critical?.length > 0 && (
                  <div className="flex items-center gap-1 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    {latestTestResult.frictionPoints.critical.length} Critical
                  </div>
                )}
                {latestTestResult.frictionPoints.high?.length > 0 && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <AlertTriangle className="w-4 h-4" />
                    {latestTestResult.frictionPoints.high.length} High
                  </div>
                )}
                {latestTestResult.frictionPoints.working?.length > 0 && (
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    {latestTestResult.frictionPoints.working.length} Working Well
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 rounded-xl bg-zinc-900 border border-zinc-800 border-dashed text-center">
          <Ghost className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No scans yet</h3>
          <p className="text-zinc-400 mb-4">
            Connect your Shopify store to start analyzing your checkout flow
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FBBF24] text-[#0A0A0A] rounded-lg hover:bg-[#F59E0B] transition-colors"
          >
            Connect Store
          </Link>
        </div>
      )}

      {/* Recent Tests */}
      {tests.length > 1 && (
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Scans</h2>
            <Link
              href="/dashboard/history"
              className="text-sm text-blue-500 hover:text-blue-400"
            >
              View All
            </Link>
          </div>

          <div className="space-y-2">
            {tests.slice(1, 5).map((test: any) => (
              <Link
                key={test.id}
                href={`/dashboard/test/${test.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    (test.overall_score || 0) >= 70
                      ? "bg-green-500/20 text-green-400"
                      : (test.overall_score || 0) >= 50
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                  }`}>
                    {test.overall_score || 0}
                  </div>
                  <span className="text-sm text-zinc-300 truncate max-w-[200px]">
                    {test.url || "Unknown"}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(test.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
