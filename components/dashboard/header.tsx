"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardHeader({ user }: { user: any }) {
  return (
    <header className="h-14 border-b border-white/[0.08] bg-[#020202]/80 backdrop-blur-xl flex items-center px-6 gap-6">
      {/* LEFT: Live Market Ticker */}
      <div className="flex flex-1 items-center gap-6 text-xs font-medium font-mono">
        <div className="flex items-center gap-2 text-zinc-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          LIVE TRAFFIC: <span className="text-white tabular-nums">412 / hr</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-zinc-500">
          AOV: <span className="text-white tabular-nums">$85.50</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-zinc-500">
          CVR: <span className="text-white tabular-nums">2.14%</span>
        </div>

        <div className="h-4 w-px bg-white/[0.1] hidden md:block" />

        <div className="flex items-center gap-2 text-[#0070F3] font-bold">
          GHOST LIFT: <span className="text-[#BFFF00]">+0.4%</span>
        </div>
      </div>

      {/* RIGHT: Actions & Profile */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-white hover:bg-white/[0.05] h-8 w-8"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-white hover:bg-white/[0.05] relative h-8 w-8"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#0070F3] border-2 border-[#020202]" />
        </Button>

        <div className="h-8 w-8 rounded-full bg-[#0070F3]/10 border border-[#0070F3]/20 flex items-center justify-center text-xs font-bold text-[#0070F3]">
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    </header>
  )
}
