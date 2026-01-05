"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Activity,
  Bot,
  Code2,
  Settings,
  LifeBuoy
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
      { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-200 bg-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">GHOST CRO</span>
          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
            ENTERPRISE
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
        {navItems.map((group) => (
          <div key={group.title}>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group",
                      isActive 
                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-zinc-200" 
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-600")} />
                    {item.label}
                    {isActive && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-zinc-200 bg-white/50">
        <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-100">
          <div className="text-xs font-medium text-zinc-900">Enterprise Plan</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">
            Usage: 14,020 / 50k sessions
          </div>
          <div className="mt-2 h-1 w-full bg-zinc-200 rounded-full overflow-hidden">
            <div className="h-full w-[28%] bg-blue-600 rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  )
}
