"use client"

import { useState, useEffect } from "react"
import { Check, ArrowRight, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toggle } from "@/components/ui/toggle"
import Link from "next/link"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [shopifyConnected, setShopifyConnected] = useState(false)
  const [storeUrl, setStoreUrl] = useState("")
  const [revenueGoal, setRevenueGoal] = useState("")
  const [slackAlerts, setSlackAlerts] = useState(false)
  const [techEmail, setTechEmail] = useState("")

  useEffect(() => {
    // Check if Shopify connection exists
    try {
      const connectionData = localStorage.getItem("ghost_shopify_connection")
      if (connectionData) {
        const data = JSON.parse(connectionData)
        setStoreUrl(data.shop || "")
        setShopifyConnected(true)
        setStep(2) // Move to configuration step
      }
    } catch (error) {
      console.error("Failed to load connection data:", error)
    }
  }, [])

  const handleLaunch = () => {
    // Store configuration
    const config = {
      revenueGoal,
      slackAlerts,
      techEmail,
      completedAt: new Date().toISOString(),
    }
    localStorage.setItem("ghost_onboarding_config", JSON.stringify(config))
    
    // Redirect to Mission Control
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50">
      <div className="max-w-xl w-full">
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              Welcome to Ghost Enterprise
            </h1>
            <p className="text-sm text-zinc-500">
              Let's configure your revenue intelligence system
            </p>
          </div>

          {/* Step 1: Success */}
          {step >= 1 && (
            <div className="mb-6 p-4 rounded-lg border border-emerald-200 bg-emerald-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-emerald-900 mb-0.5">
                    Shopify Connected Successfully
                  </div>
                  {storeUrl && (
                    <div className="flex items-center gap-2 text-xs text-emerald-700">
                      <Store className="h-3 w-3" />
                      {storeUrl}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configuration */}
          {step >= 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="revenue-goal" className="text-sm font-medium text-zinc-900 mb-2 block">
                  Monthly Revenue Goal
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <Input
                    id="revenue-goal"
                    type="text"
                    value={revenueGoal}
                    onChange={(e) => setRevenueGoal(e.target.value)}
                    placeholder="100,000"
                    className="pl-7 font-mono"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  We'll track progress toward this goal
                </p>
              </div>

              <div className="flex items-start justify-between p-4 rounded-lg border border-zinc-200">
                <div className="flex-1">
                  <Label htmlFor="slack-alerts" className="text-sm font-medium text-zinc-900 mb-1 block">
                    Enable Slack Alerts
                  </Label>
                  <p className="text-xs text-zinc-500">
                    Get notified in Slack when high-impact leaks are detected
                  </p>
                </div>
                <Toggle
                  id="slack-alerts"
                  checked={slackAlerts}
                  onCheckedChange={setSlackAlerts}
                />
              </div>

              <div>
                <Label htmlFor="tech-email" className="text-sm font-medium text-zinc-900 mb-2 block">
                  Technical Contact Email
                </Label>
                <Input
                  id="tech-email"
                  type="email"
                  value={techEmail}
                  onChange={(e) => setTechEmail(e.target.value)}
                  placeholder="dev@yourcompany.com"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  For technical notifications and system updates
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-8 pt-6 border-t border-zinc-200">
            <Button
              onClick={handleLaunch}
              className="w-full bg-[#0070F3] hover:bg-[#0060d0] text-white font-medium gap-2"
              size="lg"
            >
              Launch Mission Control
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

