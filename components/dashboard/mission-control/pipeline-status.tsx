"use client"

import { Globe, Bot, Code2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PipelineStatus() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6">
      <div className="flex items-center justify-between">
        {/* Pipeline Visualization */}
        <div className="flex items-center gap-6 flex-1">
          {/* Node 1: Live Store */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-lg border-2 border-zinc-200 bg-zinc-50 flex items-center justify-center">
              <Globe className="h-6 w-6 text-zinc-400" />
            </div>
            <span className="text-xs font-medium text-zinc-600">Live Store</span>
          </div>

          {/* Connection Line */}
          <div className="flex-1 flex items-center">
            <div className="w-full border-t-2 border-dashed border-zinc-200"></div>
          </div>

          {/* Node 2: Ghost AI */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-lg border-2 border-zinc-300 bg-white flex items-center justify-center relative">
              <Bot className="h-6 w-6 text-zinc-900" />
              {/* Pulse effect */}
              <span className="absolute inset-0 rounded-lg bg-zinc-900 opacity-20 animate-ping"></span>
            </div>
            <span className="text-xs font-medium text-zinc-900">Ghost AI</span>
          </div>

          {/* Connection Line */}
          <div className="flex-1 flex items-center">
            <div className="w-full border-t-2 border-dashed border-zinc-200"></div>
          </div>

          {/* Node 3: Sandbox (Active) */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-lg border-2 border-blue-600 bg-blue-50 flex items-center justify-center relative ring-2 ring-blue-600/20">
              <Code2 className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600">Sandbox</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-end gap-2 ml-8">
          <Button variant="outline" className="gap-2">
            Review Pending Fix
            <ArrowRight className="h-4 w-4" />
          </Button>
          <span className="text-xs text-zinc-500 font-mono">
            Patch #294 ready in Sandbox.
          </span>
        </div>
      </div>
    </div>
  )
}

