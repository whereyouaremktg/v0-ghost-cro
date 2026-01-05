"use client"

import { SimulationControls } from "@/components/dashboard/simulations/simulation-controls"
import { AgentGrid } from "@/components/dashboard/simulations/agent-grid"

export default function SimulationsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Simulations</h1>
      </div>

      {/* Controls */}
      <SimulationControls />

      {/* The Matrix */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
            Active Agents (8/50)
          </h2>
          <div className="flex gap-2 items-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono text-zinc-500">System Nominal</span>
          </div>
        </div>
        <AgentGrid />
      </div>
    </div>
  )
}
