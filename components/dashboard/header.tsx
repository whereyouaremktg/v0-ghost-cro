"use client"

import { User } from "lucide-react"

interface DashboardHeaderProps {
  user?: {
    email?: string | null
  } | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="h-14 border-b border-white/[0.08] bg-[#020202]/80 backdrop-blur-xl flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-medium text-white">Ghost CRO</h1>
      </div>

      <div className="flex items-center gap-4">
        {user?.email && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-500">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-zinc-400">{user.email}</span>
          </div>
        )}
      </div>
    </header>
  )
}
