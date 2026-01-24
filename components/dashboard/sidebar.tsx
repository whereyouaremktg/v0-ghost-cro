"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  History,
  Settings,
  Ghost
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Platform",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/history", label: "History", icon: History },
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
            <Ghost className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Ghost CRO</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
        {navItems.map((group) => (
          <div key={group.title}>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
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
                        ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-blue-500" : "text-zinc-500 group-hover:text-zinc-300"
                    )} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.08]">
        <p className="text-xs text-zinc-500 text-center">Ghost CRO v1.0</p>
      </div>
    </aside>
  )
}
