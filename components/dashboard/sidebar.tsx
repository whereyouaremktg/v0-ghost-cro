"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import useSWR from "swr"
import {
  AlertCircle,
  FlaskConical,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  Scan,
  Settings,
} from "lucide-react"

import { GhostLogo } from "@/components/ghost-logo"
import { GhostButton } from "@/components/ui/ghost-button"
import { cn } from "@/lib/utils"
import { StoreSelector } from "./store-selector"
import { createClient } from "@/lib/supabase/client"

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
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isUpgrading, setIsUpgrading] = useState(false)

  // Fetch real user data
  const { data: user } = useSWR('current-user', async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  })

  // Fetch real stores from Supabase (revalidate on focus so sidebar updates after Settings/navigation)
  const { data: storesData, mutate: mutateStores } = useSWR(
    user?.id ? `stores-${user.id}` : null,
    async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('stores')
        .select('id, shop, name')
        .eq('user_id', user!.id)
        .eq('is_active', true)
      return data || []
    },
    { revalidateOnFocus: true }
  )

  // Revalidate stores when landing after OAuth (store_connected=1), then clear the param
  useEffect(() => {
    if (searchParams.get('store_connected') !== '1') return
    mutateStores().then(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('store_connected')
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }, [searchParams, pathname, router, mutateStores])

  // Revalidate stores when mounting on dashboard so sidebar shows connected store after Settings/navigation
  useEffect(() => {
    if (pathname?.startsWith('/dashboard')) {
      mutateStores()
    }
  }, [pathname, mutateStores])

  // Map stores to the format expected by StoreSelector
  const stores = storesData?.map(store => ({
    id: store.id,
    name: store.name || store.shop?.replace('.myshopify.com', '') || 'Store',
    domain: store.shop || ''
  })) || []

  const currentStore = stores[0] || null

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      const response = await fetch('/api/shopify/billing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' })
      })
      const data = await response.json()
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl
      }
    } catch (error) {
      console.error('Failed to initiate upgrade', error)
    } finally {
      setIsUpgrading(false)
    }
  }

  const userEmail = user?.email || 'Loading...'
  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'GC'

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#0A0A0A] border-r border-[#1F1F1F] flex flex-col">
      <div className="p-4 border-b border-[#1F1F1F]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <GhostLogo size={28} />
          <span className="font-semibold text-white">GhostCRO</span>
        </Link>
      </div>

      <div className="p-4 border-b border-[#1F1F1F]">
        <StoreSelector currentStore={currentStore} stores={stores} />
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
          <GhostButton
            size="sm"
            className="w-full"
            onClick={handleUpgrade}
            disabled={isUpgrading}
          >
            {isUpgrading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Processing...
              </>
            ) : (
              'Upgrade'
            )}
          </GhostButton>
        </div>
      </div>

      <div className="p-4 border-t border-[#1F1F1F]">
        <Link href="/dashboard/settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="h-9 w-9 rounded-full bg-[#111111] text-white flex items-center justify-center text-sm">
            {userInitials}
          </div>
          <div>
            <p className="text-sm text-white font-medium truncate max-w-[140px]">{userEmail}</p>
            <p className="text-xs text-[#6B7280]">Account settings</p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
