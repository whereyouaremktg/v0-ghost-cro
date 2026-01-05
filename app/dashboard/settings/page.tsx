import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsContent } from "@/components/dashboard/settings/settings-content"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  // 1. Fetch Integrations Status
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single()

  // Note: GA4 connections table doesn't exist yet, so we'll make this optional
  // For now, we'll just check if it exists and handle gracefully
  let ga4 = null
  try {
    const { data } = await supabase
      .from("ga4_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()
    ga4 = data
  } catch {
    // Table doesn't exist yet - that's okay
    ga4 = null
  }

  // 2. Fetch Subscription Status
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single()

  const connections = {
    shopify: !!store,
    shopifyShop: store?.shop || null,
    ga4: !!ga4,
    ga4Property: ga4?.property_id || null,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      {/* Settings Container */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm min-h-[600px] flex overflow-hidden">
        <SettingsContent connections={connections} subscription={subscription} />
      </div>
    </div>
  )
}
