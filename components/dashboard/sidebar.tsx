"use client"

import type { ComponentType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import useSWR from "swr"
import {
  AlertCircle,
  FlaskConical,
  History,
  LayoutDashboard,
  Lightbulb,
  Scan,
  Settings,
} from "lucide-react"

import { GhostLogo } from "@/components/ghost-logo"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

type LatestTestRow = {
  results: {
    frictionPoints?: {
      critical?: unknown[]
      high?: unknown[]
      medium?: unknown[]
    }
  } | null
}

type NavItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  badge?: string | number
  badgeColor?: "amber"
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/scanner", label: "Scanner", icon: Scan },
  { href: "/dashboard/issues", label: "Issues", icon: AlertCircle },
  { href: "/dashboard/history", label: "History", icon: History },
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

function getIssueCountFromTest(test: LatestTestRow | null | undefined): number {
  const frictionPoints = test?.results?.frictionPoints
  if (!frictionPoints) {
    return 0
  }

  return (
    (frictionPoints.critical?.length ?? 0) +
    (frictionPoints.high?.length ?? 0) +
    (frictionPoints.medium?.length ?? 0)
  )
}

function isItemActive(pathname: string, href: string): boolean {
  if (pathname === href) {
    return true
  }

  if (href === "/dashboard/issues" && pathname.startsWith("/dashboard/issues/")) {
    return true
  }

  if (href === "/dashboard/history" && pathname.startsWith("/dashboard/test/")) {
    return true
  }

  return false
}

export function Sidebar() {
  const pathname = usePathname()

  const { data: user } = useSWR("rail-current-user", async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    return user
  })

  const { data: latestTest } = useSWR(
    user?.id ? `rail-latest-completed-test-${user.id}` : null,
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("tests")
        .select("results")
        .eq("user_id", user!.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        throw error
      }

      return (data as LatestTestRow | null) ?? null
    },
  )

  const issuesCount = getIssueCountFromTest(latestTest)

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-14 flex-col items-center border-r border-[#1A1A1A] bg-[#0A0A0A] py-4">
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/dashboard"
              className="mb-8 flex h-9 w-9 items-center justify-center rounded-lg bg-[#FBBF24] transition-opacity hover:opacity-90"
              aria-label="Go to dashboard"
            >
              <GhostLogo size={20} className="text-[#0A0A0A]" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Dashboard</TooltipContent>
        </Tooltip>

        <nav className="flex flex-1 flex-col items-center gap-1">
          {navItems.map((item) => {
            const active = isItemActive(pathname, item.href)
            const badge = item.href === "/dashboard/issues" ? issuesCount : item.badge

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-lg transition-all",
                      active
                        ? "bg-[#FBBF24]/10 text-[#FBBF24] shadow-[0_0_12px_rgba(251,191,36,0.08)]"
                        : "text-[#71717A] hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {badge !== undefined && badge !== null && badge !== 0 && (
                      <span
                        className={cn(
                          "absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border px-1 text-[10px] font-semibold leading-none",
                          item.badgeColor === "amber"
                            ? "border-[#FBBF24]/40 bg-[#FBBF24]/15 text-[#FBBF24]"
                            : "border-[#1F1F1F] bg-[#111111] text-[#9CA3AF]",
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
      </TooltipProvider>
    </aside>
  )
}
