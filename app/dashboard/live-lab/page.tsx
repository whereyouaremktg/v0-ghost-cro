"use client"

import { VitalsMonitor } from "@/components/dashboard/live-lab/vitals-monitor"
import { RealtimeFunnel } from "@/components/dashboard/live-lab/realtime-funnel"
import { ShopperFeed } from "@/components/dashboard/mission-control/shopper-feed"

export default function LiveLabPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Live Lab</h1>
      </div>

      {/* Top Row: Vitals */}
      <VitalsMonitor />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: The Funnel (2 cols) */}
        <div className="lg:col-span-2">
          <RealtimeFunnel />
        </div>

        {/* Right: The Feed (1 col) - Reusing the component from Mission Control */}
        <div className="lg:col-span-1 h-full min-h-[400px]">
          <ShopperFeed />
        </div>
      </div>
    </div>
  )
}
