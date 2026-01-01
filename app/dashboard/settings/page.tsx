"use client"

import { useState, useEffect } from "react"
import { Check, Moon, Sun, Store, X, CreditCard } from "lucide-react"
import { mockUser } from "@/lib/mock-data"

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
  const [darkMode, setDarkMode] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [shopifyStore, setShopifyStore] = useState<ShopifyStore | null>(null)
  const [shopName, setShopName] = useState("")
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  // Load Shopify connection from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("shopifyStore")
    if (stored) {
      try {
        setShopifyStore(JSON.parse(stored))
      } catch (error) {
        console.error("Failed to parse shopify store data:", error)
      }
    }

    // Load subscription data from localStorage
    const subscriptionStored = localStorage.getItem("subscription")
    if (subscriptionStored) {
      try {
        setSubscription(JSON.parse(subscriptionStored))
      } catch (error) {
        console.error("Failed to parse subscription data:", error)
      }
    }
  }, [])

  const handleConnectShopify = () => {
    if (!shopName.trim()) {
      alert("Please enter your Shopify store name")
      return
    }

    // Clean the shop name - remove protocol, trailing slashes, etc.
    let cleanShop = shopName.trim()
    cleanShop = cleanShop.replace(/^https?:\/\//, '') // Remove http:// or https://
    cleanShop = cleanShop.replace(/\/$/, '') // Remove trailing slash

    // Ensure the shop name ends with .myshopify.com
    const formattedShop = cleanShop.includes(".myshopify.com")
      ? cleanShop
      : `${cleanShop}.myshopify.com`

    // Redirect to Shopify OAuth
    window.location.href = `/api/auth/shopify?shop=${encodeURIComponent(formattedShop)}`
  }

  const handleDisconnectShopify = () => {
    localStorage.removeItem("shopifyStore")
    setShopifyStore(null)
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
            <div className="font-bold">{subscription?.plan || mockUser.plan} Plan</div>
            <div className="text-sm text-muted-foreground">
              {mockUser.testsUsed} of {mockUser.testsLimit} tests used this month
            </div>
            {subscription && (
              <div className="text-xs text-muted-foreground mt-1">
                Status: {subscription.status}
              </div>
            )}
          </div>
          <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wide border-2 border-border">
            {subscription?.status === "active" ? "Active" : "Trial"}
          </span>
        </div>
        <div className="flex gap-3">
          {subscription ? (
            <button
              onClick={handleManageSubscription}
              disabled={loadingPortal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" strokeWidth={3} />
              {loadingPortal ? "Loading..." : "Manage Subscription"}
            </button>
          ) : (
            <>
              <button
                onClick={() => window.location.href = "/pricing"}
                className="px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover"
              >
                Upgrade Plan
              </button>
              <button className="px-6 py-3 bg-card font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover">
                Billing History
              </button>
            </>
          )}
        </div>
      </div>

      {/* Shopify Integration Section */}
      <div className="bg-card border-2 border-border brutal-shadow p-6 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">
          Shopify Integration
        </h2>

        {shopifyStore ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-primary/10 border-2 border-primary">
              <Store className="h-5 w-5 text-primary" strokeWidth={3} />
              <div className="flex-1">
                <div className="font-bold text-sm">{shopifyStore.shop}</div>
                <div className="text-xs text-muted-foreground">
                  Connected {new Date(shopifyStore.connectedAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={handleDisconnectShopify}
                className="p-2 hover:bg-destructive/10 border-2 border-border transition-colors"
                title="Disconnect"
              >
                <X className="h-4 w-4 text-destructive" strokeWidth={3} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your Shopify store is connected. We can now pull analytics and checkout data for more accurate testing.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your Shopify store to enable real-time analytics, checkout data, and automated testing.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2">
                  Shopify Store Name
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="your-store.myshopify.com"
                  className="w-full px-4 py-3 bg-input border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your store name (e.g., "your-store" or "your-store.myshopify.com")
                </p>
              </div>
              <button
                onClick={handleConnectShopify}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover"
              >
                <Store className="h-4 w-4" strokeWidth={3} />
                Connect Shopify Store
              </button>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-bold">What we'll access:</p>
              <ul className="list-disc list-inside space-y-0.5 pl-2">
                <li>Read analytics and conversion data</li>
                <li>Read product and order information</li>
                <li>Analyze checkout performance</li>
              </ul>
              <p className="mt-2 italic">We never modify your store or access customer payment details.</p>
            </div>
          </div>
        )}
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
