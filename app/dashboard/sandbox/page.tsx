"use client"

import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeDiffViewer } from "@/components/dashboard/sandbox/code-diff-viewer"

export default function SandboxPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Theme Sandbox / Patch #294</h1>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Context */}
        <div className="flex flex-col gap-4">
          {/* Status Card */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6">
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-3">
              Status
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-sm font-medium text-zinc-900">Simulation Active</span>
            </div>
          </div>

          {/* Impact Card */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6">
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-3">
              Impact
            </div>
            <div className="text-2xl font-light tracking-tight text-zinc-900 font-mono">
              +4.2%
            </div>
            <div className="text-xs text-zinc-500 mt-1">Predicted Lift</div>
          </div>

          {/* Deploy Button */}
          <Button
            className="w-full bg-[#0070F3] hover:bg-[#0060d0] text-white font-medium py-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Lock className="h-4 w-4 mr-2" />
            Deploy to Production
          </Button>
        </div>

        {/* Right Column: Code Diff */}
        <div className="lg:col-span-2">
          <CodeDiffViewer />
        </div>
      </div>
    </div>
  )
}

