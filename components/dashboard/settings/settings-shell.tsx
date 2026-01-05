"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SettingsShellProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const tabs = [
  { id: "general", label: "General" },
  { id: "integrations", label: "Integrations" },
  { id: "notifications", label: "Notifications" },
  { id: "billing", label: "Billing" },
  { id: "team", label: "Team" },
]

export function SettingsShell({ activeTab, setActiveTab }: SettingsShellProps) {
  return (
    <div className="space-y-1">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "w-full justify-start text-sm font-medium transition-all duration-200",
            activeTab === tab.id
              ? "bg-zinc-100 text-blue-600"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
          )}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  )
}

