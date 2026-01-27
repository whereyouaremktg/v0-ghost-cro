"use client"

import { GhostCard } from "@/components/ui/ghost-card"

const experiments = [
  {
    id: "exp-1",
    name: "Checkout CTA copy",
    createdAt: "Created 2h ago",
    theme: "Dawn Theme",
    visitors: "1,240",
    lift: "+4.2%",
  },
  {
    id: "exp-2",
    name: "Sticky cart drawer",
    createdAt: "Created 5h ago",
    theme: "Editorial Theme",
    visitors: "980",
    lift: "+2.1%",
  },
  {
    id: "exp-3",
    name: "Product gallery zoom",
    createdAt: "Created 1d ago",
    theme: "Studio Theme",
    visitors: "2,310",
    lift: "+5.8%",
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
        <button className="h-11 px-6 rounded-xl text-sm font-medium bg-[var(--landing-accent)] text-[#0A0A0A] hover:bg-[var(--landing-accent-hover)] transition-all duration-300">
          Start experiment
        </button>
      </GhostCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experiments.map((experiment) => (
          <GhostCard key={experiment.id} className="overflow-hidden">
            <div className="h-32 bg-[#1A1A1E] flex items-start justify-between p-4">
              <span className="text-xs font-semibold tracking-[0.2em] text-[#22C55E] border border-[#22C55E]/40 bg-[#22C55E]/10 px-3 py-1 rounded-full">
                LIVE PREVIEW
              </span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {experiment.name}
                </h3>
                <p className="text-sm text-[#9CA3AF]">
                  {experiment.createdAt} • {experiment.theme}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#26262F] bg-[#15151B] px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-[#6B7280]">
                    Visitors
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {experiment.visitors}
                  </p>
                </div>
                <div className="rounded-xl border border-[#26262F] bg-[#15151B] px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-[#6B7280]">
                    Lift
                  </p>
                  <p className="text-lg font-semibold text-[#22C55E]">
                    {experiment.lift}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="h-10 rounded-lg text-sm font-medium border border-[#2D2D36] text-white hover:border-[#FBBF24]/40 hover:text-[#FBBF24] transition-colors">
                  View Code
                </button>
                <button className="h-10 rounded-lg text-sm font-semibold bg-[#FBBF24] text-[#0A0A0A] hover:bg-[#F59E0B] transition-colors">
                  Publish
                </button>
              </div>
            </div>
          </GhostCard>
        ))}
        <GhostCard className="border border-dashed border-[#2D2D36] bg-transparent flex flex-col items-center justify-center text-center px-6 py-10 hover:border-[#FBBF24] hover:text-[#FBBF24] transition-colors">
          <div className="h-12 w-12 rounded-full border border-dashed border-current flex items-center justify-center text-2xl font-semibold">
            +
          </div>
          <p className="mt-4 text-sm font-medium">New Experiment</p>
        </GhostCard>
      </div>
    </div>
  )
}
