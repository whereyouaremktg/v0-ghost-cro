"use client"

import { useState } from "react"
import { SettingsShell } from "@/components/dashboard/settings/settings-shell"
import { IntegrationsTab } from "@/components/dashboard/settings/integrations-tab"
import { NotificationsTab } from "@/components/dashboard/settings/notifications-tab"
import { BillingTab } from "@/components/dashboard/settings/billing-tab"

interface SettingsContentProps {
  connections: {
    shopify: boolean
    shopifyShop: string | null
    ga4: boolean
    ga4Property: string | null
  }
  subscription: any
}

export function SettingsContent({ connections, subscription }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState("integrations")

  return (
    <>
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-zinc-200 bg-zinc-50/50 p-4">
        <SettingsShell activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        {activeTab === "general" && (
          <div className="text-zinc-500">General Settings (Profile)</div>
        )}
        {activeTab === "integrations" && <IntegrationsTab connections={connections} />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "billing" && <BillingTab subscription={subscription} />}
        {activeTab === "team" && (
          <div className="text-zinc-500">Team Settings (Coming Soon)</div>
        )}
      </div>
    </>
  )
}

