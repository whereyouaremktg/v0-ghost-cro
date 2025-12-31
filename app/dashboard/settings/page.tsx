"use client"

import { useState } from "react"
import { Check, Moon, Sun } from "lucide-react"
import { mockUser } from "@/lib/mock-data"

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Account Section */}
      <div className="bg-card border-2 border-border brutal-shadow p-6 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">Account</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-2">Name</label>
            <input
              type="text"
              defaultValue={mockUser.name}
              className="w-full px-4 py-3 bg-input border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-2">Email</label>
            <input
              type="email"
              defaultValue={mockUser.email}
              className="w-full px-4 py-3 bg-input border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover">
            Save Changes
          </button>
        </div>
      </div>

      {/* Plan Section */}
      <div className="bg-card border-2 border-border brutal-shadow p-6 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">Plan</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-bold">{mockUser.plan} Plan</div>
            <div className="text-sm text-muted-foreground">
              {mockUser.testsUsed} of {mockUser.testsLimit} tests used this month
            </div>
          </div>
          <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wide border-2 border-border">
            Active
          </span>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover">
            Upgrade Plan
          </button>
          <button className="px-6 py-3 bg-card font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover">
            Billing History
          </button>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-card border-2 border-border brutal-shadow p-6 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">Preferences</h2>
        <div className="space-y-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <div className="font-bold text-sm">Dark Mode</div>
                <div className="text-xs text-muted-foreground">Switch between light and dark themes</div>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-7 border-2 border-border relative transition-colors ${
                darkMode ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 bg-foreground border-2 border-border transition-transform ${
                  darkMode ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm">Email Notifications</div>
              <div className="text-xs text-muted-foreground">Get notified when tests complete</div>
            </div>
            <label className="flex items-center cursor-pointer">
              <div
                className={`h-5 w-5 border-2 border-border flex items-center justify-center ${
                  emailNotifications ? "bg-primary" : "bg-card"
                }`}
                onClick={() => setEmailNotifications(!emailNotifications)}
              >
                {emailNotifications && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
              </div>
            </label>
          </div>

          {/* Weekly Digest */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm">Weekly Digest</div>
              <div className="text-xs text-muted-foreground">Receive a weekly summary of your scores</div>
            </div>
            <label className="flex items-center cursor-pointer">
              <div
                className={`h-5 w-5 border-2 border-border flex items-center justify-center ${
                  weeklyDigest ? "bg-primary" : "bg-card"
                }`}
                onClick={() => setWeeklyDigest(!weeklyDigest)}
              >
                {weeklyDigest && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border-2 border-border border-l-4 border-l-destructive brutal-shadow p-6">
        <h2 className="text-xs font-bold uppercase tracking-wide text-destructive mb-4">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="px-6 py-3 bg-destructive text-destructive-foreground font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover">
          Delete Account
        </button>
      </div>
    </div>
  )
}
