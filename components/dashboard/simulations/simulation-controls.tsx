"use client"

import { useState } from "react"
import { Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toggle } from "@/components/ui/toggle"

export function SimulationControls() {
  const [targetUrl, setTargetUrl] = useState("https://store.myshopify.com")
  const [concurrentAgents, setConcurrentAgents] = useState(50)
  const [mirrorGA4, setMirrorGA4] = useState(false)

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
        {/* Left: Configuration */}
        <div className="flex-1 space-y-4">
          {/* Target URL */}
          <div>
            <Label htmlFor="target-url" className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2 block">
              Target URL
            </Label>
            <Input
              id="target-url"
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {/* Concurrent Agents */}
          <div>
            <Label htmlFor="concurrent-agents" className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2 block">
              Concurrent Agents
            </Label>
            <select
              id="concurrent-agents"
              value={concurrentAgents}
              onChange={(e) => setConcurrentAgents(Number(e.target.value))}
              className="w-full h-9 rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-blue-600 focus-visible:ring-blue-600/50 focus-visible:ring-[3px] outline-none"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
            </select>
          </div>

          {/* Mirror GA4 Traffic */}
          <div className="flex items-center gap-3">
            <Toggle
              checked={mirrorGA4}
              onCheckedChange={setMirrorGA4}
            />
            <Label htmlFor="mirror-ga4" className="text-xs font-medium text-zinc-700 cursor-pointer">
              Real-user distribution
            </Label>
          </div>
        </div>

        {/* Middle: Stats */}
        <div className="lg:px-6 lg:border-x border-zinc-200">
          <div className="text-xs text-zinc-500">
            Capacity: 85% Available
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col gap-3 w-full lg:w-auto">
          <Button
            className="bg-[#0070F3] hover:bg-[#0060d0] text-white font-medium gap-2 h-10 px-6"
          >
            <Play className="h-4 w-4" />
            Start Simulation
          </Button>
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-2"
          >
            <Square className="h-4 w-4" />
            Stop All
          </Button>
        </div>
      </div>
    </div>
  )
}
