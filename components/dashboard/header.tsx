"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardHeader({ user }: { user: any }) {
  // Mock data for the "Live" feel - later we connect this to real stats
  return (
    <header className="h-14 border-b border-zinc-200 bg-white flex items-center px-6 gap-6">
      {/* LEFT: Live Market Ticker */}
      <div className="flex flex-1 items-center gap-6 text-xs font-medium font-mono">
        <div className="flex items-center gap-2 text-zinc-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          LIVE TRAFFIC: <span className="text-zinc-900">412 / hr</span>
        </div>
        
        <div className="hidden md:flex items-center gap-2 text-zinc-500">
          AOV: <span className="text-zinc-900">$85.50</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-zinc-500">
          CVR: <span className="text-zinc-900">2.14%</span>
        </div>

        <div className="h-4 w-px bg-zinc-200 hidden md:block" />

        <div className="flex items-center gap-2 text-blue-600 font-bold">
          GHOST LIFT: +0.4%
        </div>
      </div>

      {/* RIGHT: Actions & Profile */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-900 h-8 w-8">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-900 relative h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-red-500 border border-white" />
        </Button>
        
        <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-700">
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    </header>
  )
}

