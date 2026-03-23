"use client"

import { useState } from "react"
import { Toggle } from "@/components/ui/toggle"
import { Label } from "@/components/ui/label"

export function NotificationsTab() {
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [newLeakDetected, setNewLeakDetected] = useState(true)
  const [systemErrors, setSystemErrors] = useState(false)
  const [highImpactLeaks, setHighImpactLeaks] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Notifications</h2>
        <p className="text-sm text-[var(--ghost-text-dim)]">Choose how Ghost should alert your team.</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ghost-text-muted)]">Email Alerts</h3>

        <div className="space-y-3">
          <div className="flex items-start justify-between rounded-lg border border-[var(--ghost-bg-elevated)] bg-[var(--ghost-bg-secondary)] p-4">
            <div className="flex-1">
              <Label htmlFor="weekly-digest" className="cursor-pointer text-sm font-medium text-white">
                Weekly Digest
              </Label>
              <p className="mt-1 text-xs text-[var(--ghost-text-dim)]">
                Receive a summary of recovered revenue and scan outcomes every Monday.
              </p>
            </div>
            <Toggle id="weekly-digest" checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
          </div>

          <div className="flex items-start justify-between rounded-lg border border-[var(--ghost-bg-elevated)] bg-[var(--ghost-bg-secondary)] p-4">
            <div className="flex-1">
              <Label htmlFor="new-leak" className="cursor-pointer text-sm font-medium text-white">
                New Leak Detected
              </Label>
              <p className="mt-1 text-xs text-[var(--ghost-text-dim)]">
                Alert when Ghost identifies a new high-confidence conversion leak.
              </p>
            </div>
            <Toggle id="new-leak" checked={newLeakDetected} onCheckedChange={setNewLeakDetected} />
          </div>

          <div className="flex items-start justify-between rounded-lg border border-[var(--ghost-bg-elevated)] bg-[var(--ghost-bg-secondary)] p-4">
            <div className="flex-1">
              <Label htmlFor="system-errors" className="cursor-pointer text-sm font-medium text-white">
                System Errors
              </Label>
              <p className="mt-1 text-xs text-[var(--ghost-text-dim)]">
                Notify when analysis jobs fail due to external platform issues.
              </p>
            </div>
            <Toggle id="system-errors" checked={systemErrors} onCheckedChange={setSystemErrors} />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-[var(--ghost-bg-elevated)] pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ghost-text-muted)]">
          Real-time Alerts (Slack)
        </h3>

        <div className="flex items-start justify-between rounded-lg border border-[var(--ghost-bg-elevated)] bg-[var(--ghost-bg-secondary)] p-4">
          <div className="flex-1">
            <Label htmlFor="high-impact" className="cursor-pointer text-sm font-medium text-white">
              High Impact Leaks (&gt; $1000/day)
            </Label>
            <p className="mt-1 text-xs text-[var(--ghost-text-dim)]">
              Send instant Slack notifications for the highest-impact opportunities.
            </p>
          </div>
          <Toggle id="high-impact" checked={highImpactLeaks} onCheckedChange={setHighImpactLeaks} />
        </div>
      </div>
    </div>
  )
}
