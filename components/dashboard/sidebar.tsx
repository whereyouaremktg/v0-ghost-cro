"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Play, Clock, Settings, ChevronDown, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/ghost", label: "Mission Control", icon: LayoutDashboard, anchor: "overview" },
  { href: "/ghost#timeline", label: "Timeline", icon: Clock, anchor: "timeline" },
  { href: "/ghost#simulation", label: "Re-run Simulation", icon: Play, anchor: "simulation" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
  user?: {
    name: string
    email: string
  }
  subscription?: {
    plan: string
    tests_used: number
    tests_limit: number
  }
}

export function Sidebar({ user, subscription }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [currentHash, setCurrentHash] = useState("")

  const displayUser = user || { name: "Demo User", email: "demo@ghostcro.com" }
  const displaySub = subscription || { plan: "free", tests_used: 0, tests_limit: 1 }

  // Listen to hash changes
  useEffect(() => {
    const updateHash = () => {
      setCurrentHash(window.location.hash.replace("#", ""))
    }
    updateHash()
    window.addEventListener("hashchange", updateHash)
    return () => window.removeEventListener("hashchange", updateHash)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/ghost" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight font-heading">GHOST CRO</span>
          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 border-2 border-border">
            BETA
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = item.anchor 
              ? pathname === "/ghost" && currentHash === item.anchor
              : pathname === item.href
            const handleClick = (e: React.MouseEvent) => {
              if (item.anchor) {
                e.preventDefault()
                // Update URL hash
                window.location.hash = item.anchor
                setCurrentHash(item.anchor)
              }
            }
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleClick}
                  className={`flex items-center gap-3 px-4 py-3 font-medium text-sm tracking-wide rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/30 accent-glow"
                      : "bg-transparent hover:bg-muted/50 hover:border-border/50"
                  }`}
                >
                  <item.icon className="h-5 w-5" strokeWidth={2.5} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Plan & Usage */}
      <div className="p-4 border-t border-border">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {displaySub.plan} Plan
            </span>
            {displaySub.plan === "free" && (
              <Link href="/#pricing" className="text-xs font-bold uppercase tracking-wide text-primary hover:underline">
                Upgrade
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex-1 h-3 border-2 border-border bg-card">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min((displaySub.tests_used / displaySub.tests_limit) * 100, 100)}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold">
              {displaySub.tests_used}/{displaySub.tests_limit}
            </span>
          </div>
        </div>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted/50 transition-all duration-300"
          >
            <div className="h-10 w-10 bg-foreground text-background flex items-center justify-center font-bold text-sm border border-border rounded-lg">
              {displayUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-sm">{displayUser.name}</div>
              <div className="text-xs text-muted-foreground truncate">{displayUser.email}</div>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl shadow-lg">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted text-left"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
