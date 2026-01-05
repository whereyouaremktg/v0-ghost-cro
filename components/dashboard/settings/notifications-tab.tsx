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
        <h2 className="text-lg font-semibold tracking-tight mb-1">Notifications</h2>
        <p className="text-sm text-zinc-500">Configure how you receive alerts</p>
      </div>

      {/* Email Alerts */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">Email Alerts</h3>

        <div className="space-y-4">
          {/* Weekly Digest */}
          <div className="flex items-start justify-between p-4 rounded-lg border border-zinc-200 bg-white">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <Label htmlFor="weekly-digest" className="text-sm font-medium text-zinc-900 cursor-pointer">
                  Weekly Digest
                </Label>
              </div>
              <p className="text-xs text-zinc-500">
                Get a summary of recovered revenue every Monday
              </p>
            </div>
            <Toggle
              id="weekly-digest"
              checked={weeklyDigest}
              onCheckedChange={setWeeklyDigest}
            />
          </div>

          {/* New Leak Detected */}
          <div className="flex items-start justify-between p-4 rounded-lg border border-zinc-200 bg-white">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <Label htmlFor="new-leak" className="text-sm font-medium text-zinc-900 cursor-pointer">
                  New Leak Detected
                </Label>
              </div>
              <p className="text-xs text-zinc-500">
                Receive an email when Ghost identifies a new revenue leak
              </p>
            </div>
            <Toggle
              id="new-leak"
              checked={newLeakDetected}
              onCheckedChange={setNewLeakDetected}
            />
          </div>

          {/* System Errors */}
          <div className="flex items-start justify-between p-4 rounded-lg border border-zinc-200 bg-white">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <Label htmlFor="system-errors" className="text-sm font-medium text-zinc-900 cursor-pointer">
                  System Errors
                </Label>
              </div>
              <p className="text-xs text-zinc-500">
                Get notified when there are issues with Ghost's analysis engine
              </p>
            </div>
            <Toggle
              id="system-errors"
              checked={systemErrors}
              onCheckedChange={setSystemErrors}
            />
          </div>
        </div>
      </div>

      {/* Real-time Alerts (Slack) */}
      <div className="space-y-4 pt-6 border-t border-zinc-200">
        <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">Real-time Alerts (Slack)</h3>

        <div className="flex items-start justify-between p-4 rounded-lg border border-zinc-200 bg-white">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <Label htmlFor="high-impact" className="text-sm font-medium text-zinc-900 cursor-pointer">
                High Impact Leaks (&gt; $1000/day)
              </Label>
            </div>
            <p className="text-xs text-zinc-500">
              Send instant Slack notifications for leaks exceeding $1000 per day
            </p>
          </div>
          <Toggle
            id="high-impact"
            checked={highImpactLeaks}
            onCheckedChange={setHighImpactLeaks}
          />
        </div>
      </div>
    </div>
  )
}

