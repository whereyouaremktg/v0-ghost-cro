"use client"

import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"
import { GhostInput } from "@/components/ui/ghost-input"
import { GhostSelect } from "@/components/ui/ghost-select"

const tabs = [
  "General",
  "Billing",
  "Integrations",
  "Notifications",
  "Team",
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Settings</h2>
        <p className="text-sm text-[#9CA3AF]">
          Manage your store configuration and subscriptions.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg border ${
              index === 0
                ? "bg-[#111111] border-[#2A2A2A] text-white"
                : "border-[#1F1F1F] text-[#9CA3AF]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <GhostCard className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[#9CA3AF]">Store name</label>
            <GhostInput defaultValue="Northwind Co." className="mt-2" />
          </div>
          <div>
            <label className="text-sm text-[#9CA3AF]">Timezone</label>
            <GhostSelect className="mt-2" defaultValue="pst">
              <option value="pst">Pacific Time (PST)</option>
              <option value="est">Eastern Time (EST)</option>
              <option value="gmt">GMT</option>
            </GhostSelect>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-[#1F1F1F] pt-6">
          <div>
            <p className="text-white font-medium">Billing</p>
            <p className="text-sm text-[#9CA3AF]">
              You are on the Free plan. Upgrade for automated scans.
            </p>
          </div>
          <GhostButton>Upgrade plan</GhostButton>
        </div>
      </GhostCard>
    </div>
  )
}
