"use client"

import { useState, useEffect } from "react"
import { Store, X, CreditCard, LogOut, Brain, Zap, Bell, Shield, Check, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ShopifyStore {
  shop: string
  accessToken: string
  connectedAt: string
}

interface SubscriptionData {
  customerId?: string
  subscriptionId?: string
  shopify_charge_id?: string
  status: string
  plan: string
  tests_limit?: number
  tests_used?: number
  trial_ends_at?: string
  current_period_end?: string
}

interface ShopifySubscription {
  id: string
  name: string
  status: string
  createdAt: string
  currentPeriodEnd: string | null
  trialDays: number
  test: boolean
}

interface GA4Credentials {
  propertyId: string
  clientEmail: string
  privateKey: string
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  // Ghost Brain Settings
  const [scanFrequency, setScanFrequency] = useState<"daily" | "weekly" | "manual">("weekly")
  const [sensitivityLevel, setSensitivityLevel] = useState<"low" | "normal" | "aggressive">("normal")
  const [autoRescanOnChanges, setAutoRescanOnChanges] = useState(true)

  // Revenue Alerts
  const [dailyLeakAlert, setDailyLeakAlert] = useState(true)
  const [dailyLeakThreshold, setDailyLeakThreshold] = useState(500)
  const [cvrDropAlert, setCvrDropAlert] = useState(true)
  const [cvrDropThreshold, setCvrDropThreshold] = useState(10)
  const [paymentFailureAlert, setPaymentFailureAlert] = useState(true)

  // Account
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [shopifyStore, setShopifyStore] = useState<ShopifyStore | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [shopifySubscription, setShopifySubscription] = useState<ShopifySubscription | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [loadingCancel, setLoadingCancel] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [isTrialing, setIsTrialing] = useState(false)
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0)

  // GA4 Integration
  const [ga4Connected, setGa4Connected] = useState(false)
  const [ga4PropertyId, setGa4PropertyId] = useState("")
  const [ga4SuccessMessage, setGa4SuccessMessage] = useState<string | null>(null)

  // Load data on mount and check for OAuth errors
  useEffect(() => {
    // Check for OAuth errors in URL params
    const params = new URLSearchParams(window.location.search)
    const error = params.get("error")
    const message = params.get("message")
    const success = params.get("success")

    if (error) {
      let errorMessage = "Failed to connect."

      // Handle GA4-specific errors
      if (error === "ga4_access_denied") {
        errorMessage = "Google Analytics access was denied. Please try again and grant permission."
      } else if (error.startsWith("ga4_") || error.includes("analytics")) {
        errorMessage = message ? decodeURIComponent(message) : "Failed to connect Google Analytics."
      } else {
        // Handle Shopify errors
        switch (error) {
          case "missing_parameters":
            errorMessage = "Missing required OAuth parameters. Please try again."
            break
          case "invalid_state":
            errorMessage = "OAuth session expired. Please try connecting again."
            break
          case "token_exchange_failed":
            errorMessage = message ? decodeURIComponent(message) : "Failed to exchange authorization code. Please check your app configuration."
            break
          case "oauth_not_configured":
            errorMessage = message ? decodeURIComponent(message) : "OAuth is not configured. Please set up your environment variables."
            break
          case "callback_failed":
            errorMessage = "OAuth callback failed. Please try again."
            break
          default:
            errorMessage = message ? decodeURIComponent(message) : `OAuth error: ${error}`
        }
      }

      setOauthError(errorMessage)

      // Clear error from URL
      window.history.replaceState({}, "", window.location.pathname)
    }

    // Handle GA4 success
    if (success === "ga4_connected") {
      setGa4SuccessMessage("Google Analytics 4 connected successfully!")
      setGa4Connected(true)

      // Clear success from URL
      window.history.replaceState({}, "", window.location.pathname)

      // Clear success message after 5 seconds
      setTimeout(() => setGa4SuccessMessage(null), 5000)
    }
    // Load Shopify connection
    const stored = localStorage.getItem("shopifyStore")
    if (stored) {
      try {
        setShopifyStore(JSON.parse(stored))
      } catch (error) {
        console.error("Failed to parse shopify store data:", error)
      }
    }

    // Load subscription data
    const subscriptionStored = localStorage.getItem("subscription")
    if (subscriptionStored) {
      try {
        setSubscription(JSON.parse(subscriptionStored))
      } catch (error) {
        console.error("Failed to parse subscription data:", error)
      }
    }

    // Load user data (would come from Supabase in production)
    const userStored = localStorage.getItem("user")
    if (userStored) {
      try {
        const user = JSON.parse(userStored)
        setName(user.name || "")
        setEmail(user.email || "")
      } catch (error) {
        console.error("Failed to parse user data:", error)
      }
    }

    // Check GA4 connection status
    const checkGA4Connection = async () => {
      try {
        const response = await fetch("/api/analytics/ga4/status")
        if (response.ok) {
          const data = await response.json()
          setGa4Connected(data.connected)
          setGa4PropertyId(data.propertyId || "")
        }
      } catch (error) {
        console.error("Failed to check GA4 status:", error)
      }
    }

    checkGA4Connection()
  }, [])

  // Fetch subscription status from Shopify Billing API
  const fetchSubscriptionStatus = async () => {
    if (!shopifyStore) return

    setLoadingStatus(true)
    try {
      const response = await fetch("/api/shopify/billing/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop: shopifyStore.shop,
          accessToken: shopifyStore.accessToken,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setShopifySubscription(data.shopifySubscription)
        setIsTrialing(data.isTrialing || false)
        setTrialDaysRemaining(data.trialDaysRemaining || 0)

        if (data.localSubscription) {
          setSubscription(data.localSubscription)
        }
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error)
    } finally {
      setLoadingStatus(false)
    }
  }

  // Fetch subscription when shopifyStore changes
  useEffect(() => {
    if (shopifyStore) {
      fetchSubscriptionStatus()
    }
  }, [shopifyStore])

  const handleDisconnectShopify = () => {
    if (confirm("Disconnect your Shopify store? You'll need to reconnect to run scans.")) {
      localStorage.removeItem("shopifyStore")
      setShopifyStore(null)
      router.push("/ghost")
    }
  }

  const handleCancelSubscription = async () => {
    if (!shopifyStore || !shopifySubscription) {
      alert("No active subscription found")
      return
    }

    if (!confirm("Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.")) {
      return
    }

    setLoadingCancel(true)
    try {
      const response = await fetch("/api/shopify/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop: shopifyStore.shop,
          accessToken: shopifyStore.accessToken,
          subscriptionId: shopifySubscription.id,
        }),
      })

      if (response.ok) {
        alert("Subscription cancelled successfully. You'll have access until the end of your billing period.")
        await fetchSubscriptionStatus()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to cancel subscription")
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      alert(error instanceof Error ? error.message : "Failed to cancel subscription. Please try again.")
    } finally {
      setLoadingCancel(false)
    }
  }

  // Legacy Stripe portal handler (for existing Stripe subscribers)
  const handleManageSubscription = async () => {
    if (!subscription?.customerId) {
      alert("No active subscription found")
      return
    }

    setLoadingPortal(true)
    try {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId: subscription.customerId }),
      })

      if (!response.ok) {
        throw new Error("Failed to create portal session")
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Error opening portal:", error)
      alert("Failed to open subscription portal. Please try again.")
    } finally {
      setLoadingPortal(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const handleConnectGA4 = () => {
    // Redirect to OAuth flow
    window.location.href = "/api/auth/google-analytics"
  }

  const handleDisconnectGA4 = async () => {
    if (confirm("Disconnect Google Analytics 4? You'll lose access to real analytics data.")) {
      try {
        const response = await fetch("/api/analytics/ga4/disconnect", {
          method: "POST",
        })

        if (response.ok) {
          setGa4Connected(false)
          setGa4PropertyId("")
          alert("Google Analytics 4 disconnected successfully")
        } else {
          alert("Failed to disconnect GA4. Please try again.")
        }
      } catch (error) {
        console.error("Error disconnecting GA4:", error)
        alert("Network error. Please try again.")
      }
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-semibold tracking-tight mb-2 font-heading">Ghost Control</h1>
        <p className="text-sm text-muted-foreground">Configure your revenue intelligence system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ghost Brain */}
          <div className="bg-card/40 border border-border/30 rounded-xl shadow-sm p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary/10 border border-primary/30 rounded-xl">
                <Brain className="h-5 w-5 text-primary" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight font-heading">Ghost Brain</h2>
                <p className="text-xs text-muted-foreground">Configure how Ghost analyzes your store</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Scan Frequency */}
              <div>
                <label className="block text-sm font-medium mb-3">Scan Frequency</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["daily", "weekly", "manual"] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setScanFrequency(freq)}
                      className={`px-4 py-3 rounded-xl border transition-all duration-300 ${
                        scanFrequency === freq
                          ? "bg-primary/10 border-primary/50 shadow-sm shadow-primary/10"
                          : "bg-background/50 border-border/30 hover:border-border/50"
                      }`}
                    >
                      <div className="text-sm font-medium capitalize">{freq}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {freq === "daily" ? "Every 24h" : freq === "weekly" ? "Every 7 days" : "On demand"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sensitivity Level */}
              <div>
                <label className="block text-sm font-medium mb-3">Sensitivity Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["low", "normal", "aggressive"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setSensitivityLevel(level)}
                      className={`px-4 py-3 rounded-xl border transition-all duration-300 ${
                        sensitivityLevel === level
                          ? "bg-primary/10 border-primary/50 shadow-sm shadow-primary/10"
                          : "bg-background/50 border-border/30 hover:border-border/50"
                      }`}
                    >
                      <div className="text-sm font-medium capitalize">{level}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {level === "low"
                          ? "Fewer alerts"
                          : level === "normal"
                            ? "Balanced"
                            : "Maximum detection"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Re-scan Toggle */}
              <div className="flex items-center justify-between pt-4 border-t border-border/20">
                <div>
                  <div className="text-sm font-medium">Auto re-scan on checkout changes</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Automatically trigger a scan when Ghost detects checkout modifications
                  </div>
                </div>
                <Toggle checked={autoRescanOnChanges} onCheckedChange={setAutoRescanOnChanges} />
              </div>
            </div>
          </div>

          {/* Connected Systems */}
          <div className="bg-card/40 border border-border/30 rounded-xl shadow-sm p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary/10 border border-primary/30 rounded-xl">
                <Zap className="h-5 w-5 text-primary" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight font-heading">Connected Systems</h2>
                <p className="text-xs text-muted-foreground">Integrations and data sources</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* OAuth Error Display */}
              {oauthError && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-destructive mb-1">Connection Failed</h4>
                      <p className="text-xs text-destructive/80">{oauthError}</p>
                      {oauthError.includes("environment variables") && (
                        <div className="mt-3 text-xs text-destructive/70">
                          <p className="font-medium mb-1">Required environment variables:</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            <li>SHOPIFY_CLIENT_ID</li>
                            <li>SHOPIFY_CLIENT_SECRET</li>
                            <li>NEXTAUTH_URL</li>
                          </ul>
                          <p className="mt-2">See SHOPIFY_SETUP.md for setup instructions.</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setOauthError(null)}
                      className="text-destructive/60 hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Shopify - Primary, Required */}
              {shopifyStore ? (
                <div className="bg-background/50 border border-primary/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 border border-primary/40 rounded-xl">
                        <Store className="h-4 w-4 text-primary" strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{shopifyStore.shop}</span>
                          <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-medium rounded">
                            Primary
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Connected {new Date(shopifyStore.connectedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleDisconnectShopify}
                      className="p-2 hover:bg-destructive/10 rounded-xl transition-all duration-300"
                      title="Disconnect"
                    >
                      <X className="h-4 w-4 text-destructive" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-background/30 border border-border/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted/50 border border-border/30 rounded-lg">
                      <Store className="h-4 w-4 text-muted-foreground" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Shopify Store</div>
                      <div className="text-xs text-muted-foreground">Required to run scans</div>
                    </div>
                    <Button
                      onClick={() => router.push("/ghost")}
                      variant="outline"
                      size="sm"
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              )}

              {/* Google Analytics 4 */}
              {ga4SuccessMessage && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-green-500 mb-1">Success!</h4>
                      <p className="text-xs text-green-500/80">{ga4SuccessMessage}</p>
                    </div>
                    <button
                      onClick={() => setGa4SuccessMessage(null)}
                      className="text-green-500/60 hover:text-green-500 transition-colors"
                    >
                      <X className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              )}

              {ga4Connected ? (
                <div className="bg-background/50 border border-primary/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 border border-primary/40 rounded-xl">
                        <span className="text-lg">📊</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">Google Analytics 4</span>
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/20 text-green-500 text-[10px] font-medium rounded">
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                            Connected
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {ga4PropertyId ? `Property: ${ga4PropertyId}` : "OAuth connected"}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleDisconnectGA4}
                      className="p-2 hover:bg-destructive/10 rounded-xl transition-all duration-300"
                      title="Disconnect"
                    >
                      <X className="h-4 w-4 text-destructive" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-background/30 border border-border/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted/50 border border-border/30 rounded-lg">
                      <span className="text-lg">📊</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Google Analytics 4</div>
                      <div className="text-xs text-muted-foreground">Connect with one click - no JSON files</div>
                    </div>
                    <Button
                      onClick={handleConnectGA4}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Connect with Google
                    </Button>
                  </div>
                </div>
              )}

              {/* Coming Soon Integrations */}
              {[
                { name: "Klaviyo", icon: "📧" },
                { name: "Heatmap Tools", icon: "🔥" },
              ].map((integration) => (
                <div key={integration.name} className="bg-background/30 border border-border/20 rounded-lg p-4 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted/30 border border-border/20 rounded-lg">
                      <span className="text-lg">{integration.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{integration.name}</div>
                      <div className="text-xs text-muted-foreground">Coming soon</div>
                    </div>
                    <span className="px-2 py-1 bg-muted/50 text-muted-foreground text-[10px] font-medium rounded">
                      Soon
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Alerts */}
          <div className="bg-card/40 border border-border/30 rounded-xl shadow-sm p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary/10 border border-primary/30 rounded-xl">
                <Bell className="h-5 w-5 text-primary" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight font-heading">Revenue Alerts</h2>
                <p className="text-xs text-muted-foreground">Get notified of critical revenue events</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Daily Leak Alert */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Daily leak exceeds threshold</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Alert when daily revenue leak exceeds your threshold
                    </div>
                  </div>
                  <Toggle checked={dailyLeakAlert} onCheckedChange={setDailyLeakAlert} />
                </div>
                {dailyLeakAlert && (
                  <div className="pl-4 border-l-2 border-primary/30">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Alert when leak exceeds</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                        <Input
                          type="number"
                          value={dailyLeakThreshold}
                          onChange={(e) => setDailyLeakThreshold(Number(e.target.value))}
                          className="w-24 pl-7 h-8 text-sm bg-background/50 border-border/30"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">per day</span>
                    </div>
                  </div>
                )}
              </div>

              {/* CVR Drop Alert */}
              <div className="space-y-3 pt-4 border-t border-border/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Conversion rate drop</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Alert when CVR drops by percentage threshold
                    </div>
                  </div>
                  <Toggle checked={cvrDropAlert} onCheckedChange={setCvrDropAlert} />
                </div>
                {cvrDropAlert && (
                  <div className="pl-4 border-l-2 border-primary/30">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Alert when CVR drops by</span>
                      <Input
                        type="number"
                        value={cvrDropThreshold}
                        onChange={(e) => setCvrDropThreshold(Number(e.target.value))}
                        className="w-20 h-8 text-sm bg-background/50 border-border/30"
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Failure Alert */}
              <div className="flex items-center justify-between pt-4 border-t border-border/20">
                <div>
                  <div className="text-sm font-medium">Payment failure spike</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Alert when payment failures increase significantly
                  </div>
                </div>
                <Toggle checked={paymentFailureAlert} onCheckedChange={setPaymentFailureAlert} />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Account & Security */}
        <div className="space-y-6">
          {/* Account & Security */}
          <div className="bg-card/40 border border-border/30 rounded-xl shadow-sm p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary/10 border border-primary/30 rounded-xl">
                <Shield className="h-5 w-5 text-primary" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight font-heading">Account</h2>
                <p className="text-xs text-muted-foreground">Profile & security</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5">Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/50 border-border/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-border/30"
                />
              </div>
              <Button className="w-full" size="sm">
                Save Changes
              </Button>
            </div>
          </div>

          {/* Billing */}
          <div className="bg-card/40 border border-border/30 rounded-xl shadow-sm p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-4 w-4 text-muted-foreground" strokeWidth={2.5} />
              <h3 className="text-sm font-semibold">Billing</h3>
            </div>
            <div className="space-y-3">
              {/* Current Plan */}
              <div>
                <div className="text-xs text-muted-foreground mb-1">Current Plan</div>
                <div className="text-sm font-semibold capitalize">{subscription?.plan || "Free"} Plan</div>
              </div>

              {/* Status Badge */}
              {subscription?.status === "active" && subscription?.plan !== "free" && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Status</div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-500 text-xs font-medium rounded">
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                      Active
                    </span>
                    {isTrialing && (
                      <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded">
                        Trial: {trialDaysRemaining} days left
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Tests Used */}
              {subscription?.tests_limit && subscription.tests_limit > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Tests This Period</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, ((subscription.tests_used || 0) / subscription.tests_limit) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {subscription.tests_used || 0} / {subscription.tests_limit === 999 ? "∞" : subscription.tests_limit}
                    </span>
                  </div>
                </div>
              )}

              {/* Next Billing Date */}
              {subscription?.current_period_end && subscription?.plan !== "free" && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {subscription.status === "canceled" ? "Access Until" : "Next Billing Date"}
                  </div>
                  <div className="text-sm">
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {subscription?.shopify_charge_id && subscription?.status === "active" ? (
                // Shopify Billing - Show cancel button
                <Button
                  onClick={handleCancelSubscription}
                  disabled={loadingCancel}
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive"
                >
                  {loadingCancel ? "Canceling..." : "Cancel Subscription"}
                </Button>
              ) : subscription?.customerId ? (
                // Legacy Stripe billing - Show manage button
                <Button
                  onClick={handleManageSubscription}
                  disabled={loadingPortal}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {loadingPortal ? "Loading..." : "Manage Subscription"}
                </Button>
              ) : (
                // No subscription - Show upgrade button
                <Button
                  onClick={() => router.push("/pricing")}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Upgrade Plan
                </Button>
              )}

              {/* Refresh Status */}
              {shopifyStore && (
                <Button
                  onClick={fetchSubscriptionStatus}
                  disabled={loadingStatus}
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                >
                  {loadingStatus ? "Refreshing..." : "Refresh Status"}
                </Button>
              )}
            </div>
          </div>

          {/* Sign Out */}
          <div className="bg-card/40 border border-border/30 rounded-xl shadow-sm p-6 animate-fade-in">
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="w-full text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" strokeWidth={2.5} />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
