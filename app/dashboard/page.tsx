"use client"

import { RevenueHero } from "@/components/dashboard/mission-control/revenue-hero"
import { PipelineStatus } from "@/components/dashboard/mission-control/pipeline-status"
import { ShopperFeed } from "@/components/dashboard/mission-control/shopper-feed"

export default function MissionControlPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Section: Revenue Hero and Pipeline Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Hero takes up 4 columns (1/3) */}
        <div className="lg:col-span-4 h-full">
          <RevenueHero />
        </div>

        {/* Pipeline Status takes up 8 columns (2/3) */}
        <div className="lg:col-span-8 h-full">
          <PipelineStatus />
        </div>
      </div>

      {/* Bottom Section: Live Feed */}
      <div className="min-h-[400px]">
        <ShopperFeed />
      </div>
    </div>
  )
}
