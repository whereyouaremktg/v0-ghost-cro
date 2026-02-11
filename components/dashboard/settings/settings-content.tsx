"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

import { IntegrationsTab } from "@/components/dashboard/settings/integrations-tab"
import { NotificationsTab } from "@/components/dashboard/settings/notifications-tab"
import { BillingTab } from "@/components/dashboard/settings/billing-tab"
import { cn } from "@/lib/utils"

interface SettingsContentProps {
  connections: {
    shopify: boolean
    shopifyShop: string | null
    ga4: boolean
    ga4Property: string | null
  }
  subscription: any
}

type TabId = "integrations" | "billing" | "notifications"

const tabs: { id: TabId; label: string }[] = [
  { id: "integrations", label: "Integrations" },
  { id: "billing", label: "Billing" },
  { id: "notifications", label: "Notifications" },
]

export function SettingsContent({ connections, subscription }: SettingsContentProps) {
  const searchParams = useSearchParams()

  const initialTab = useMemo<TabId>(() => {
    const queryTab = searchParams.get("tab")
    if (queryTab === "integrations" || queryTab === "billing" || queryTab === "notifications") {
      return queryTab
    }
    return "integrations"
  }, [searchParams])

  const [activeTab, setActiveTab] = useState<TabId>(initialTab)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  return (
    <div className="space-y-6">
      <div className="border-b border-[#1A1A1A]">
        <div className="flex flex-wrap gap-1 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-[#FBBF24]/10 text-[#FBBF24]"
                  : "text-[#71717A] hover:bg-[#111111] hover:text-white",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "integrations" && <IntegrationsTab connections={connections} />}
      {activeTab === "notifications" && <NotificationsTab />}
      {activeTab === "billing" && <BillingTab subscription={subscription} />}
    </div>
  )
}
