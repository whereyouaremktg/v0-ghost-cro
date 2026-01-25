"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AlertCircle,
  FlaskConical,
  LayoutDashboard,
  Lightbulb,
  Scan,
  Settings,
} from "lucide-react"

import { GhostLogo } from "@/components/ghost-logo"
import { GhostButton } from "@/components/ui/ghost-button"
import { cn } from "@/lib/utils"
import { StoreSelector } from "./store-selector"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/scanner", label: "Scanner", icon: Scan },
  { href: "/dashboard/issues", label: "Issues", icon: AlertCircle, badge: 12 },
  {
    href: "/dashboard/experiments",
    label: "Experiments",
    icon: FlaskConical,
    badge: "Beta",
    badgeColor: "amber",
  },
  { href: "/dashboard/insights", label: "Insights", icon: Lightbulb },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const stores = [
    { id: "1", name: "Northwind Co.", domain: "northwind" },
    { id: "2", name: "Studio Supply", domain: "studiosupply" },
  ]

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#0A0A0A] border-r border-[#1F1F1F] flex flex-col">
      <div className="p-4 border-b border-[#1F1F1F]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <GhostLogo size={28} />
          <span className="font-semibold text-white">GhostCRO</span>
        </Link>
      </div>

      <div className="p-4 border-b border-[#1F1F1F]">
        <StoreSelector currentStore={stores[0]} stores={stores} />
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-[#111111] text-white"
                    : "text-[#9CA3AF] hover:text-white hover:bg-[#111111]",
                )}
              >
                <span className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full border",
                      item.badgeColor === "amber"
                        ? "border-[#FBBF24]/40 text-[#FBBF24]"
                        : "border-[#1F1F1F] text-[#9CA3AF]",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-[#1F1F1F]">
        <div className="bg-[#111111] rounded-lg p-4">
          <p className="text-sm text-white font-medium mb-1">Free Plan</p>
          <p className="text-xs text-[#6B7280] mb-3">3 scans remaining</p>
          <GhostButton size="sm" className="w-full">
            Upgrade
          </GhostButton>
        </div>
      </div>

      <div className="p-4 border-t border-[#1F1F1F]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#111111] text-white flex items-center justify-center text-sm">
            GC
          </div>
          <div>
            <p className="text-sm text-white font-medium">alex@ghostcro.ai</p>
            <p className="text-xs text-[#6B7280]">Account settings</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
