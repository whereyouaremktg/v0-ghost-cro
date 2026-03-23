"use client"

import { useState, useEffect } from "react"
import { Check, ArrowRight, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toggle } from "@/components/ui/toggle"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [shopifyConnected, setShopifyConnected] = useState(false)
  const [storeUrl, setStoreUrl] = useState("")
  const [revenueGoal, setRevenueGoal] = useState("")
  const [slackAlerts, setSlackAlerts] = useState(false)
  const [techEmail, setTechEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Fetch Shopify connection from Supabase (server-side only)
    const fetchShopifyConnection = async () => {
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          console.error("User not authenticated")
          return
        }

        // Fetch store connection from Supabase
        const { data: store, error: storeError } = await supabase
          .from('stores')
          .select('shop')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle()

        if (storeError) {
          console.error("Failed to fetch store connection:", storeError)
          return
        }

        if (store) {
          setStoreUrl(store.shop || "")
          setShopifyConnected(true)
          setStep(2) // Move to configuration step
        }
      } catch (error) {
        console.error("Failed to load connection data:", error)
      }
    }

    fetchShopifyConnection()
  }, [])

  const handleLaunch = async () => {
    setIsSaving(true)
    const supabase = createClient()

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error("User not authenticated")
        setIsSaving(false)
        return
      }

      // Update profile with CRM data
      const updates: {
        technical_contact_email?: string
        monthly_revenue_goal?: number
        phone?: string
      } = {}

      if (techEmail) {
        updates.technical_contact_email = techEmail
      }
      if (revenueGoal) {
        // Remove commas and parse
        const goal = parseFloat(revenueGoal.replace(/,/g, ''))
        if (!isNaN(goal)) {
          updates.monthly_revenue_goal = goal
        }
      }
      if (phone) {
        updates.phone = phone
      }

      // Save to Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (updateError) {
        console.error("Failed to update profile:", updateError)
      } else {
        // Trigger CRM sync
        try {
          await fetch('/api/crm/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          })
        } catch (crmError) {
          console.error("CRM sync failed (non-critical):", crmError)
        }
      }

      // Store configuration locally as backup
      const config = {
        revenueGoal,
        slackAlerts,
        techEmail,
        phone,
        completedAt: new Date().toISOString(),
      }
      localStorage.setItem("ghost_onboarding_config", JSON.stringify(config))
      
      // Redirect to Mission Control
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Failed to save onboarding data:", error)
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="rounded-xl border border-[var(--ghost-bg-elevated)] bg-[var(--ghost-bg-primary)] p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">
              Welcome to Ghost CRO
            </h1>
            <p className="text-sm text-[var(--ghost-text-dim)]">
              Let&apos;s configure your revenue intelligence system
            </p>
          </div>

          {/* Step 1: Success */}
          {step >= 1 && (
            <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="mb-0.5 text-sm font-semibold text-emerald-300">
                    Shopify Connected Successfully
                  </div>
                  {storeUrl && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
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
                <Label htmlFor="revenue-goal" className="mb-2 block text-sm font-medium text-white">
                  Monthly Revenue Goal
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ghost-text-dim)]">$</span>
                  <Input
                    id="revenue-goal"
                    type="text"
                    value={revenueGoal}
                    onChange={(e) => setRevenueGoal(e.target.value)}
                    placeholder="100,000"
                    className="border-[var(--ghost-bg-elevated)] bg-[var(--ghost-bg-secondary)] pl-7 font-mono text-white placeholder:text-[var(--ghost-text-subtle)]"
                  />
                </div>
                <p className="mt-1 text-xs text-[var(--ghost-text-dim)]">
                  We&apos;ll track progress toward this goal
                </p>
              </div>

              <div className="flex items-start justify-between rounded-lg border border-[var(--ghost-bg-elevated)] p-4">
                <div className="flex-1">
                  <Label htmlFor="slack-alerts" className="mb-1 block text-sm font-medium text-white">
                    Enable Slack Alerts
                  </Label>
                  <p className="text-xs text-[var(--ghost-text-dim)]">
                    Get notified in Slack when high-impact leaks are detected
                  </p>
                </div>
                <Toggle
                  checked={slackAlerts}
                  onCheckedChange={setSlackAlerts}
                />
              </div>

              <div>
                <Label htmlFor="tech-email" className="mb-2 block text-sm font-medium text-white">
                  Technical Contact Email
                </Label>
                <Input
                  id="tech-email"
                  type="email"
                  value={techEmail}
                  onChange={(e) => setTechEmail(e.target.value)}
                  placeholder="dev@yourcompany.com"
                  className="border-[var(--ghost-bg-elevated)] bg-[var(--ghost-bg-secondary)] text-white placeholder:text-[var(--ghost-text-subtle)]"
                />
                <p className="mt-1 text-xs text-[var(--ghost-text-dim)]">
                  For technical notifications and system updates
                </p>
              </div>

              <div>
                <Label htmlFor="phone" className="mb-2 block text-sm font-medium text-white">
                  Phone Number <span className="font-normal text-[var(--ghost-text-dim)]">(Optional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="border-[var(--ghost-bg-elevated)] bg-[var(--ghost-bg-secondary)] text-white placeholder:text-[var(--ghost-text-subtle)]"
                />
                <p className="mt-1 text-xs text-[var(--ghost-text-dim)]">
                  For account verification and important updates
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-8 border-t border-[var(--ghost-bg-elevated)] pt-6">
            <Button
              onClick={handleLaunch}
              disabled={isSaving}
              className="w-full gap-2 bg-[var(--ghost-accent-primary)] font-medium text-[var(--ghost-bg-primary)] hover:bg-[var(--ghost-accent-secondary)]"
              size="lg"
            >
              {isSaving ? "Saving..." : "Launch Mission Control"}
              {!isSaving && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

