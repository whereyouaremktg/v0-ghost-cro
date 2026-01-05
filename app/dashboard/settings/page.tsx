"use client"

import { useState } from "react"
import { SettingsShell } from "@/components/dashboard/settings/settings-shell"
import { IntegrationsTab } from "@/components/dashboard/settings/integrations-tab"
import { NotificationsTab } from "@/components/dashboard/settings/notifications-tab"
import { BillingTab } from "@/components/dashboard/settings/billing-tab"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("integrations")

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      {/* Settings Container */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm min-h-[600px] flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r border-zinc-200 bg-zinc-50/50 p-4">
          <SettingsShell activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {activeTab === "general" && (
            <div className="text-zinc-500">General Settings (Profile)</div>
          )}
          {activeTab === "integrations" && <IntegrationsTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "billing" && <BillingTab />}
          {activeTab === "team" && (
            <div className="text-zinc-500">Team Settings (Coming Soon)</div>
          )}
        </div>
      </div>
    </div>
  )
}
