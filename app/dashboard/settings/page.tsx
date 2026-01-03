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
  customerId: string
  subscriptionId: string
  status: string
  plan: string
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
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [oauthError, setOauthError] = useState<string | null>(null)

  // Load data on mount and check for OAuth errors
  useEffect(() => {
    // Check for OAuth errors in URL params
    const params = new URLSearchParams(window.location.search)
    const error = params.get("error")
    const message = params.get("message")
    
    if (error) {
      let errorMessage = "Failed to connect Shopify store."
      
      switch (error) {
        case "missing_parameters":
          errorMessage = "Missing required OAuth parameters. Please try again."
          break
        case "invalid_state":
          errorMessage = "OAuth session expired. Please try connecting again."
          break
        case "token_exchange_failed":
          errorMessage = message ? decodeURIComponent(message) : "Failed to exchange authorization code. Please check your Shopify app configuration."
          break
        case "oauth_not_configured":
          errorMessage = message ? decodeURIComponent(message) : "Shopify OAuth is not configured. Please set up your environment variables."
          break
        case "callback_failed":
          errorMessage = "OAuth callback failed. Please try again."
          break
        default:
          errorMessage = message ? decodeURIComponent(message) : `OAuth error: ${error}`
      }
      
      setOauthError(errorMessage)
      
      // Clear error from URL
      window.history.replaceState({}, "", window.location.pathname)
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
  }, [])

  const handleDisconnectShopify = () => {
    if (confirm("Disconnect your Shopify store? You'll need to reconnect to run scans.")) {
      localStorage.removeItem("shopifyStore")
      setShopifyStore(null)
      router.push("/ghost")
    }
  }

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

              {/* Coming Soon Integrations */}
              {[
                { name: "Google Analytics 4", icon: "📊" },
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
              <div>
                <div className="text-xs text-muted-foreground mb-1">Current Plan</div>
                <div className="text-sm font-semibold">{subscription?.plan || "Free"} Plan</div>
              </div>
              {subscription ? (
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
                <Button
                  onClick={() => router.push("/pricing")}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Upgrade Plan
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
