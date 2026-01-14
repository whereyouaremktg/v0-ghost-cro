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
  // We use .maybeSingle() because the user might not have connected anything yet
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle()

  // Check for GA4 connection
  const { data: ga4 } = await supabase
    .from("ga4_connections")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

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
    ga4Property: ga4?.selected_property_id || null,
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
