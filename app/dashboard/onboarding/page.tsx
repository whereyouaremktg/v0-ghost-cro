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
  const [shopDomain, setShopDomain] = useState("")
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

  const handleConnectShopify = () => {
    if (!shopDomain.trim()) {
      alert("Please enter your Shopify store domain")
      return
    }

    // Clean up the domain (remove https://, www., trailing slashes)
    let cleanDomain = shopDomain.trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')

    // If they didn't include .myshopify.com, add it
    if (!cleanDomain.includes('.myshopify.com')) {
      cleanDomain = `${cleanDomain}.myshopify.com`
    }

    // Redirect to Shopify OAuth
    window.location.href = `/api/auth/shopify/initiate?shop=${encodeURIComponent(cleanDomain)}`
  }

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

          {/* Step 1: Connect Shopify */}
          {!shopifyConnected ? (
            <div className="mb-6 p-6 rounded-lg border border-blue-200 bg-blue-50">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-12 h-12 mb-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Connect Your Shopify Store</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Enter your Shopify store domain to get started
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="shop-domain" className="text-sm font-medium text-blue-900 mb-2 block">
                    Store Domain
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="shop-domain"
                      type="text"
                      value={shopDomain}
                      onChange={(e) => setShopDomain(e.target.value)}
                      placeholder="mystore"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleConnectShopify()
                        }
                      }}
                    />
                    <span className="flex items-center text-sm text-zinc-500">.myshopify.com</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Example: if your store is "mystore.myshopify.com", enter "mystore"
                  </p>
                </div>

                <Button
                  onClick={handleConnectShopify}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Connect Shopify Store
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
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

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-zinc-900 mb-2 block">
                  Phone Number <span className="text-zinc-400 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  For account verification and important updates
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          {shopifyConnected && (
            <div className="mt-8 pt-6 border-t border-zinc-200">
              <Button
                onClick={handleLaunch}
                disabled={isSaving}
                className="w-full bg-[#0070F3] hover:bg-[#0060d0] text-white font-medium gap-2"
                size="lg"
              >
                {isSaving ? "Saving..." : "Launch Mission Control"}
                {!isSaving && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

