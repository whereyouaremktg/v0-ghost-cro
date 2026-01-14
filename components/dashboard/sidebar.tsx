"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Activity,
  Bot,
  Code2,
  Settings,
  Ghost
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Platform",
    items: [
      { href: "/dashboard", label: "Mission Control", icon: LayoutDashboard },
      { href: "/dashboard/live-lab", label: "Live Lab", icon: Activity },
      { href: "/dashboard/simulations", label: "Simulations", icon: Bot },
      { href: "/dashboard/sandbox", label: "Theme Sandbox", icon: Code2 },
    ]
  },
  {
    title: "Configuration",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/[0.08] bg-[#020202]/80 backdrop-blur-xl flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/[0.08]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            <Ghost className="w-5 h-5 text-[#0070F3]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white">GHOST CRO</span>
            <span className="bg-[#0070F3] text-white text-[10px] font-bold px-2 py-0.5 rounded">
              ENTERPRISE
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
        {navItems.map((group) => (
          <div key={group.title}>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-[#0070F3]/10 text-[#0070F3] border border-[#0070F3]/20"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-[#0070F3]" : "text-zinc-500 group-hover:text-zinc-300"
                    )} />
                    {item.label}
                    {isActive && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#0070F3]" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/[0.08]">
        <div className="rounded-xl bg-white/[0.03] p-4 border border-white/[0.08]">
          <div className="text-xs font-medium text-white">Enterprise Plan</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">
            Usage: 14,020 / 50k sessions
          </div>
          <div className="mt-3 h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
            <div className="h-full w-[28%] bg-[#0070F3] rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  )
}
