"use client"

import { RevenueHero } from "@/components/dashboard/mission-control/revenue-hero"
import { PipelineStatus } from "@/components/dashboard/mission-control/pipeline-status"
import { ShopperFeed } from "@/components/dashboard/mission-control/shopper-feed"

export default function MissionControlPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Section: Revenue Hero and Pipeline Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Hero takes up 1 column */}
        <div className="h-full">
          <RevenueHero />
        </div>

        {/* Pipeline Status takes up 2 columns */}
        <div className="lg:col-span-2 h-full">
          <PipelineStatus />
        </div>
      </div>

      {/* Bottom Section: Live Feed */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden min-h-[400px]">
        <ShopperFeed />
      </div>
    </div>
  )
}
