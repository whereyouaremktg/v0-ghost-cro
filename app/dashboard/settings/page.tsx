"use client"

import { useState, useEffect } from "react"
import { Loader2, Check, ExternalLink, Unlink } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsPage() {
  const { userId, isLoading: authLoading } = useAuthUserId()
  const [profile, setProfile] = useState<any>(null)
  const [store, setStore] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [ga4Status, setGa4Status] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [phone, setPhone] = useState("")
  const [revenueGoal, setRevenueGoal] = useState("")
  const [techEmail, setTechEmail] = useState("")

  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      const supabase = createClient()

      const [profileRes, storeRes, subRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("stores").select("shop, is_active").eq("user_id", userId).eq("is_active", true).maybeSingle(),
        supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle(),
      ])

      if (profileRes.data) {
        setProfile(profileRes.data)
        setFullName(profileRes.data.full_name || "")
        setCompanyName(profileRes.data.company_name || "")
        setPhone(profileRes.data.phone || "")
        setRevenueGoal(profileRes.data.monthly_revenue_goal?.toString() || "")
        setTechEmail(profileRes.data.technical_contact_email || "")
      }
      if (storeRes.data) setStore(storeRes.data)
      if (subRes.data) setSubscription(subRes.data)

      // Fetch GA4 status
      try {
        const ga4Res = await fetch("/api/analytics/ga4/status")
        if (ga4Res.ok) {
          setGa4Status(await ga4Res.json())
        }
      } catch {}

      setLoading(false)
    }

    fetchData()
  }, [userId])

  const handleSaveProfile = async () => {
    if (!userId) return
    setSaving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          company_name: companyName,
          phone,
          monthly_revenue_goal: revenueGoal ? parseInt(revenueGoal) : null,
          technical_contact_email: techEmail,
        })
        .eq("id", userId)

      if (error) throw error
      toast.success("Profile saved")
    } catch {
      toast.error("Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const handleUpgrade = async (plan: string) => {
    try {
      const res = await fetch("/api/shopify/billing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl
      } else {
        toast.error("Could not create billing URL")
      }
    } catch {
      toast.error("Failed to start upgrade")
    }
  }

  if (loading || authLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Monthly revenue goal ($)</Label>
                  <Input
                    type="number"
                    value={revenueGoal}
                    onChange={(e) => setRevenueGoal(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Technical contact email</Label>
                <Input
                  type="email"
                  value={techEmail}
                  onChange={(e) => setTechEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subscription</CardTitle>
              <CardDescription>Manage your plan and usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-[hsl(var(--surface-2))]">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))] capitalize">
                    {subscription?.plan || "free"} Plan
                  </p>
                  <p className="text-xs text-[hsl(var(--text-muted))]">
                    {subscription?.tests_used ?? 0} / {subscription?.tests_limit ?? 3} scans used
                  </p>
                </div>
                <Badge variant={subscription?.status === "active" ? "success" : "secondary"}>
                  {subscription?.status || "free"}
                </Badge>
              </div>

              {(!subscription || subscription.plan === "free") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PlanCard
                    name="Growth"
                    price="$99/mo"
                    tests="15 scans"
                    onUpgrade={() => handleUpgrade("growth")}
                  />
                  <PlanCard
                    name="Scale"
                    price="$150/mo"
                    tests="Unlimited scans"
                    onUpgrade={() => handleUpgrade("scale")}
                    popular
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <div className="space-y-4">
            {/* Shopify */}
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[hsl(var(--success-soft))] flex items-center justify-center">
                      <Check className="h-5 w-5 text-[hsl(var(--success))]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Shopify</p>
                      <p className="text-xs text-[hsl(var(--text-muted))]">
                        {store?.shop || "Not connected"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={store ? "success" : "secondary"}>
                    {store ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* GA4 */}
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      ga4Status?.connected
                        ? "bg-[hsl(var(--success-soft))]"
                        : "bg-[hsl(var(--surface-2))]"
                    }`}>
                      {ga4Status?.connected ? (
                        <Check className="h-5 w-5 text-[hsl(var(--success))]" />
                      ) : (
                        <ExternalLink className="h-5 w-5 text-[hsl(var(--text-dim))]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Google Analytics 4</p>
                      <p className="text-xs text-[hsl(var(--text-muted))]">
                        {ga4Status?.connected ? "Connected" : "Enrich scans with real traffic data"}
                      </p>
                    </div>
                  </div>
                  {ga4Status?.connected ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await fetch("/api/analytics/ga4/disconnect", { method: "POST" })
                        setGa4Status({ connected: false })
                        toast.success("GA4 disconnected")
                      }}
                    >
                      <Unlink className="h-3.5 w-3.5" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = "/api/auth/google-analytics"
                      }}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PlanCard({
  name,
  price,
  tests,
  onUpgrade,
  popular,
}: {
  name: string
  price: string
  tests: string
  onUpgrade: () => void
  popular?: boolean
}) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        popular
          ? "border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.05)]"
          : "border-[hsl(var(--border-default))]"
      }`}
    >
      {popular && (
        <Badge className="mb-2">Popular</Badge>
      )}
      <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{name}</p>
      <p className="text-xl font-bold text-[hsl(var(--text-primary))] mt-1">{price}</p>
      <p className="text-xs text-[hsl(var(--text-muted))] mb-3">{tests}</p>
      <Button size="sm" className="w-full" onClick={onUpgrade}>
        Upgrade
      </Button>
    </div>
  )
}
