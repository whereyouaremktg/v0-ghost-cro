"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Scan,
  AlertTriangle,
  Clock,
  Lightbulb,
  Settings,
  Ghost,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/scanner", icon: Scan, label: "Scanner" },
  { href: "/dashboard/issues", icon: AlertTriangle, label: "Issues" },
  { href: "/dashboard/history", icon: Clock, label: "History" },
  { href: "/dashboard/insights", icon: Lightbulb, label: "Insights" },
]

const bottomItems = [
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] transition-all duration-300",
          expanded ? "w-52" : "w-14"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-center border-b border-[hsl(var(--border-default))]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Ghost className="h-6 w-6 text-[hsl(var(--accent))]" />
            {expanded && (
              <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">
                Ghost CRO
              </span>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 px-2 py-3">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)

            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]"
                    : "text-[hsl(var(--text-muted))] hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--text-primary))]"
                )}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {expanded && <span>{item.label}</span>}
              </Link>
            )

            if (!expanded) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return link
          })}
        </nav>

        {/* Bottom */}
        <div className="flex flex-col gap-1 px-2 pb-3">
          {bottomItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]"
                    : "text-[hsl(var(--text-muted))] hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--text-primary))]"
                )}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {expanded && <span>{item.label}</span>}
              </Link>
            )

            if (!expanded) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return link
          })}

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center rounded-lg px-2.5 py-2 text-[hsl(var(--text-dim))] hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--text-muted))] transition-colors"
          >
            {expanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
