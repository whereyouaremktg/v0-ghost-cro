"use client"

import { FlaskConical } from "lucide-react"

import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"

const experiments = [
  {
    id: "exp-1",
    name: "Checkout CTA copy",
    status: "Running",
    lift: "+4.2%",
  },
  {
    id: "exp-2",
    name: "Sticky cart drawer",
    status: "Draft",
    lift: "--",
  },
]

export default function ExperimentsPage() {
  return (
    <div className="space-y-6">
      <GhostCard className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Experiments</h2>
          <p className="text-sm text-[#9CA3AF]">
            Launch guided A/B tests (Beta).
          </p>
        </div>
        <GhostButton>Start experiment</GhostButton>
      </GhostCard>

      <div className="grid gap-4">
        {experiments.map((experiment) => (
          <GhostCard key={experiment.id} className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#FBBF24]/10 flex items-center justify-center">
                  <FlaskConical className="h-5 w-5 text-[#FBBF24]" />
                </div>
                <div>
                  <p className="text-white font-medium">{experiment.name}</p>
                  <p className="text-xs text-[#6B7280]">{experiment.status}</p>
                </div>
              </div>
              <span className="text-sm text-[#9CA3AF]">{experiment.lift}</span>
            </div>
          </GhostCard>
        ))}
      </div>
    </div>
  )
}
